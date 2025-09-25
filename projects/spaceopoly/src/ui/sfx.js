/*───────────────────────────────────────────────────────────┐
│ FILE: src/ui/sfx.js                                       │
└───────────────────────────────────────────────────────────*/
import { $, el } from '../utils/dom.js';
import { BOARD, COLORS } from '../constants.js';
import { game } from '../state/gameState.js';
import { tileCenter } from '../geometry/boardGeom.js';
import { tokenEls } from './boardRender.js';

const FX = {
  TOAST_TOP: '60vh',
  TOAST_MS:  3000,
  ARC_AMP:   6,
  TRAIL_N:   12
};

/* Audio */
let ctx = null, master = null;
function ensureAudio(){
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.28;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}
function noiseBuffer(seconds=0.5){
  const c = ensureAudio();
  const b = c.createBuffer(1, Math.floor(c.sampleRate*seconds), c.sampleRate);
  const data = b.getChannelData(0);
  for (let i=0;i<data.length;i++) data[i] = (Math.random()*2-1);
  return b;
}
function playNoise({seconds=0.5, band='white', gain=0.4}){
  const c = ensureAudio();
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(seconds);
  let node = src;
  if (band !== 'white'){
    const biq = c.createBiquadFilter();
    biq.type = band === 'band' ? 'bandpass' : (band === 'low' ? 'lowpass' : 'highpass');
    biq.frequency.value = band === 'band' ? 800 : (band === 'low' ? 1000 : 2000);
    biq.Q.value = 0.7;
    node = src.connect(biq);
  }
  const g = c.createGain();
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + seconds);
  node.connect(g).connect(master);
  src.start();
}
function sweep(f0, f1, dur=0.3, type='sine', vol=0.1){
  const c = ensureAudio();
  const o = c.createOscillator();
  o.type = type;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g).connect(master);
  o.frequency.setValueAtTime(f0, c.currentTime);
  o.frequency.exponentialRampToValueAtTime(f1, c.currentTime + dur);
  o.start(); o.stop(c.currentTime + dur);
}
function blip(freq=880, dur=0.15, type='sine', vol=0.25){
  const c = ensureAudio();
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, c.currentTime);
  const g = c.createGain();
  g.gain.setValueAtTime(vol, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  o.connect(g).connect(master);
  o.start(); o.stop(c.currentTime + dur);
}

/* Public SFX */
export function diceRoll(){
  ensureAudio();
  playNoise({seconds:0.55, band:'band', gain:0.5});
  sweep(220, 660, 0.4, 'sawtooth', 0.08);
  const ticks = 4 + Math.floor(Math.random()*3);
  for (let i=0;i<ticks;i++){
    setTimeout(()=>blip(500 + Math.random()*300, .05, 'square', .12), 70 + i*70);
  }
}

/* Land effects — themed for Space-Opoly */
export function landFX(pid, idx){
  const t = BOARD[idx].t;
  const name = BOARD[idx].name;
  let accent = '#6ec7ff', icon='✨', tone=()=>{};

  const owner   = game.owners[idx];
  const h       = (game.houses[idx] || 0);

  const isForSale = (t==='P' && owner == null);
  const isMine    = (t==='P' && owner === pid);
  const isOther   = (t==='P' && owner != null && owner !== pid);
  const hasHotel  = (t==='P' && h >= 5);

  switch(t){
    case 'P': {
      accent = COLORS[BOARD[idx].color] || '#6ec7ff';
      icon = '🪐';
      if (isForSale){ icon='🏷️'; tone=()=>{ sweep(480, 720, .28, 'triangle', .18); blip(960,.07,'triangle',.18); }; }
      else if (isMine){ icon='💠'; tone=()=>{ blip(880,.08,'sine',.22); setTimeout(()=>blip(1320,.08,'sine',.2),80); }; }
      else if (isOther && hasHotel){ icon='🛖'; accent='#ff2bd6'; tone=()=>{ sweep(300, 180, .22, 'sawtooth', .20); setTimeout(()=>blip(220,.16,'square',.22),160); }; }
      else if (isOther){ icon='🛰️'; accent='#ff5e5e'; tone=()=>{ blip(400,.12,'square',.2); setTimeout(()=>blip(360,.12,'square',.2),110); }; }
      break;
    }
    case 'RR':  icon='🚀'; accent='#ffd166'; tone=()=>{ blip(300,.16,'sawtooth',.22); setTimeout(()=>blip(220,.14,'sawtooth',.2),130); }; break; // Spaceport
    case 'UT':  {
      const isLife = /Life Support/i.test(name);
      icon = isLife ? '🫧' : '⛽️';
      accent = isLife ? '#56d7ff' : '#ffee60';
      tone=()=>playNoise({seconds:.28, band:'high', gain:.28});
      break;
    }
    case 'CH':   icon=''; accent='#a0ffb8'; tone=()=>{ blip(660,.1,'square',.22); setTimeout(()=>blip(990,.08,'square',.20),90); }; break; // Mission Control
    case 'CH?':  icon=''; accent='#b4a0ff'; tone=()=>{ blip(520,.12,'square',.24); }; break; // Deep Space
    case 'TAX':  icon='💸'; accent='#ff6262'; tone=()=>{ blip(240,.18,'sine',.22); setTimeout(()=>sweep(300,160,.24,'sawtooth',.12),100); }; break;
    case 'GO':   icon='🚀'; accent='#7dffa3'; tone=()=>{ blip(660,.1,'triangle',.24); setTimeout(()=>blip(990,.1,'triangle',.22),80); }; break; // Launch
    case 'JAIL': icon='🌌'; accent='#ffa260'; tone=()=>{ blip(440,.14,'square',.2); }; break; // Deep Space
    case 'PARK': icon='🛸'; accent='#60e7ff'; tone=()=>{ blip(760,.1,'triangle',.2); }; break; // Deep Space Station
    case 'GOTOJAIL': icon='⛔'; accent='#ff5e5e'; tone=()=>{ blip(300,.18,'square',.24); setTimeout(()=>blip(260,.18,'square',.24),140); }; break;
  }

  banner(`${icon} ${name}`, accent);
  flashTile(idx, accent, { thick: t==='P', sustained: isOther || isForSale });
  tokenBloom(pid);
  tone();
  burst(idx, accent, isOther && hasHotel ? 18 : 10);
}

/* Banner & visual helpers (unchanged API) */
function ensureStyles(){ return; }
function layer(){
  ensureStyles();
  let host = $('fxLayer');
  if (!host) {
    host = el('div', { id:'fxLayer' });
    (document.body || document.documentElement).append(host);
  }
  let b = $('fxBanner');
  if (!b) {
    b = el('div', { id:'fxBanner' }, [
      el('span', { className:'icon' }),
      el('span', { className:'text' })
    ]);
    host.append(b);
  }
  return host;
}
export function banner(text, color){
  const host = layer();
  const b = $('fxBanner');
  if(!b) return;

  const [first, ...rest] = String(text).split(' ');
  const iconSpan = b.querySelector('.icon');
  const textSpan = b.querySelector('.text');
  if (iconSpan && textSpan && rest.length){
    iconSpan.textContent = first;
    textSpan.textContent = rest.join(' ');
  } else {
    textSpan.textContent = text;
  }

  b.style.borderColor = color;
  b.style.boxShadow = `0 8px 30px ${hexToRgba(color,.4)}, inset 0 1px 0 rgba(255,255,255,.06)`;
  b.style.display = 'block';
  b.classList.add('show');
  setTimeout(()=>{ b.classList.remove('show'); b.style.display='none'; }, FX.TOAST_MS);
}

export function flashTile(idx, color, opts={}){
  const grid = $('grid'); if (!grid) return;
  const tile = grid.querySelector(`.tile[data-idx="${idx}"]`); if (!tile) return;

  const glow = hexToRgba(color, .85);
  const prevBox = tile.style.boxShadow;
  const prevFil = tile.style.filter;
  const prevTrn = tile.style.transition;

  tile.style.transition = 'box-shadow .25s ease, filter .25s ease';
  tile.style.boxShadow  = `inset 0 0 0 2px rgba(255,255,255,.12), 0 0 34px ${glow}`;
  tile.style.filter     = 'brightness(1.35)';

  const hold = opts.sustained ? 950 : 720;
  setTimeout(()=> tile.style.filter = 'none', 320);
  setTimeout(()=>{
    tile.style.boxShadow = prevBox;
    tile.style.filter    = prevFil;
    tile.style.transition= prevTrn;
  }, hold);
}

export function burst(idx, color, count = 10) {
  const host = layer();
  const grid = $('grid'); if (!grid) return;
  const rect = grid.getBoundingClientRect();

  const { cx, cy } = tileCenter(idx);
  const px0 = rect.left + (cx/100) * rect.width;
  const py0 = rect.top  + (cy/100) * rect.height;

  for (let i = 0; i < count; i++) {
    const d = document.createElement('div');
    d.className = 'trailDot';
    d.style.background = color;
    d.style.boxShadow  = `0 0 12px ${hexToRgba(color,.9)}, 0 0 28px ${hexToRgba(color,.6)}`;
    d.style.left = `${px0}px`; d.style.top = `${py0}px`;
    host.appendChild(d);

    const ang  = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random()*40;
    const dx = Math.cos(ang) * dist;
    const dy = Math.sin(ang) * dist;

    const t0 = performance.now();
    const dur = 700;

    function step(now){
      const t = Math.min(1, (now - t0)/dur);
      d.style.transform = `translate(${dx*t}px, ${dy*t}px)`;
      d.style.opacity   = String(1 - t);
      if (t < 1) requestAnimationFrame(step);
      else d.remove();
    }
    requestAnimationFrame(step);
  }
}

function hexToRgba(hex, a = 1) {
  if (hex.startsWith('rgb')) return hex;
  const c = hex.replace('#', '');
  const n = parseInt(c.length === 3 ? c.split('').map(x => x + x).join('') : c, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}

export function tokenBloom(pid) {
  const tok = tokenEls[pid];
  if (!tok) return;
  const prev = tok.style.filter;
  tok.style.filter =
    'drop-shadow(0 0 16px rgba(255,255,255,.55)) drop-shadow(0 0 36px rgba(255,255,255,.35))';
  setTimeout(()=>{ tok.style.filter = prev; }, 700);
}

export function travelStepFX(pid, fromIdx, toIdx) {
  const host = layer();
  const grid = $('grid'); if (!grid) return;
  const rect = grid.getBoundingClientRect();

  let ax, ay;
  const tok = tokenEls[pid];
  if (tok) {
    const trect = tok.getBoundingClientRect();
    const tx = trect.left + trect.width  / 2;
    const ty = trect.top  + trect.height / 2;
    ax = ((tx - rect.left) / rect.width)  * 100;
    ay = ((ty - rect.top)  / rect.height) * 100;
  } else {
    ({ cx: ax, cy: ay } = tileCenter(fromIdx));
  }

  const { cx: bx, cy: by } = tileCenter(toIdx);

  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const vx = bx - ax, vy = by - ay;
  const vlen = Math.hypot(vx, vy) || 1;
  const nx = -vy / vlen, ny = vx / vlen;
  const cx1 = mx + nx * FX.ARC_AMP;
  const cy1 = my + ny * FX.ARC_AMP;

  const color = pid === 0 ? 'rgba(255,120,120,.95)' : 'rgba(96,170,255,.95)';
  const N = FX.TRAIL_N;

  for (let i = 0; i < N; i++) {
    const dot = document.createElement('div');
    dot.className = 'trailDot';
    dot.style.background = color;
    dot.style.boxShadow  = `0 0 12px ${color}, 0 0 24px ${color}`;
    dot.style.zIndex  = '10000';
    host.appendChild(dot);

    const t0  = performance.now() + i * 14;
    const dur = 280 + Math.random() * 80;

    function step(now) {
      const t = Math.min(1, (now - t0) / dur);
      const x = (1 - t)*(1 - t)*ax + 2*(1 - t)*t*cx1 + t*t*bx;
      const y = (1 - t)*(1 - t)*ay + 2*(1 - t)*t*cy1 + t*t*by;
      const px = rect.left + (x/100) * rect.width;
      const py = rect.top  + (y/100) * rect.height;
      dot.style.left    = `${px}px`;
      dot.style.top     = `${py}px`;
      dot.style.opacity = String(1 - t);
      if (t < 1) requestAnimationFrame(step);
      else dot.remove();
    }
    requestAnimationFrame(step);
  }
}
