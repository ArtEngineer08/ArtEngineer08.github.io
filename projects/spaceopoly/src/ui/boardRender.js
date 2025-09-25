/*───────────────────────────────────────────────────────────┐
│ FILE: src/ui/boardRender.js                               │
└───────────────────────────────────────────────────────────*/
import { $, el, money }               from '../utils/dom.js';
import { COLORS, BOARD, PROPERTIES }  from '../constants.js';
import { game }                       from '../state/gameState.js';
import { propertyMenu }               from '../mechanics/properties.js';
import * as movement                  from '../mechanics/movement.js';
import {
  tileRect, tileCenter, sideOf, isCorner
} from '../geometry/boardGeom.js';

export const tokenEls = [
  el('div', { className:'token p0' }),
  el('div', { className:'token p1' })
];

const fullSpec = name => PROPERTIES.find(p => p.name === name);

/* Move log panel into board center */
function mountLogInCenter(grid){
  let logEl = $('#log');
  if(!logEl){
    logEl = el('div', { id:'log', className:'log' });
  }
  let wrap = $('#log-wrap-board');
  if(!wrap){
    wrap = el('div', { id:'log-wrap-board', className:'boardLogWrap' });
  }
  if(!wrap.contains(logEl)){ wrap.append(logEl); }
  logEl.style.display = '';
  if(!grid.contains(wrap)){ grid.append(wrap); }
}

/* Board title branding */
function mountBoardTitle(grid){
  let t = $('#boardTitle');
  if (!t) {
    t = el('div', { id:'boardTitle', className:'boardTitle' }, [
      el('div', { className:'brand' }, [
        el('div', { className:'mono',    textContent:'SPACE-OPOLY' }),
        el('div', { className:'edition', textContent:'Solar System Edition' })
      ])
    ]);
  }
  if (!grid.contains(t)) grid.append(t);
}

function buildTile(i) {
  const spec = BOARD[i];
  const d = el('div', { className: 'tile', dataset: { idx: i } });

  if (isCorner(i)) d.classList.add('corner'); else d.classList.add(sideOf(i));

  const { x, y, w, h } = tileRect(i);
  Object.assign(d.style, { left:`${x}%`, top:`${y}%`, width:`${w}%`, height:`${h}%` });

  d.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (movement.hasPendingMove()) {
      const { pid, teleport } = movement.consumePendingMove();
      movement.movePlayerDirect(pid, i, teleport);
      return;
    }
    propertyMenu(game.current, i, [e.clientX, e.clientY]);
  });

  d.append(el('div', { className: 'ownerDot', dataset: { idx: i }, style: { display: 'none' } }));
  d.append(el('div', { className: 'devMarker', dataset: { idx: i } }));

  if (isCorner(i)) {
    const wrap = el('div', { className: 'cornerInner' });
    const big  = el('div', { className: 'big' });
    const ico  = el('div', { className: 'icon' });

    if (i === 0) {
      big.textContent = 'LAUNCH'; ico.textContent = '🚀';
      wrap.append(ico, big);
    } else if (i === 10) {
      big.textContent = 'DEEP SPACE'; ico.textContent = '🌌';
      wrap.append(ico, big);
    } else if (i === 20) {
      big.textContent = 'DEEP SPACE STATION'; ico.textContent = '🛰️';
      const pot = el('div', { id: 'fpPot', className: 'price' });
      pot.textContent = money(game.freeParkingPot);
      wrap.append(ico, big, pot);
    } else if (i === 30) {
      big.textContent = 'LOST IN SPACE'; ico.textContent = '⛔';
      wrap.append(ico, big);
    }

    d.append(wrap);
    return d;
  }

  // Non-corner
  if (spec.t === 'P') {
    const bar = el('div', { className: 'bar' });
    bar.style.background = COLORS[spec.color];

    const nm = el('div', { className: 'name', textContent: spec.name });
    const pr = el('div', {
      className: 'price',
      textContent: money(fullSpec(spec.name).purchasePrice)
    });

    d.append(bar, nm, pr);
  } else {
    const nm = el('div', { className: 'name', textContent: spec.name });
    d.append(nm);

    if (spec.t === 'RR' || spec.t === 'UT') {
      d.append(el('div', {
        className: 'price',
        textContent: money(fullSpec(spec.name).purchasePrice)
      }));
    }

    if (spec.t === 'TAX') {
      d.append(el('div', {
        className: 'price',
        textContent: `Pay ${money(spec.cost)}`
      }));
    }
  }

  return d;
}

export function buildBoard(){
  const grid = $('grid');
  grid.innerHTML = '';

  mountLogInCenter(grid);
  mountBoardTitle(grid);

  BOARD.forEach((_,i)=>grid.append(buildTile(i)));
  tokenEls.forEach(tok=>grid.append(tok));

  applyOwnershipStyles();
  positionTokens();
  updateDevMarkers();
  updateParkingPot();
}

/* Ownership tint & mortgage grey */
export function applyOwnershipStyles(){
  const grid=$('grid');
  grid.querySelectorAll('.tile').forEach(t=>t.classList.remove('ownedP0','ownedP1','mortgaged'));

  game.owners.forEach((owner,idx)=>{
    if(owner==null) return;
    const tile=grid.querySelector(`.tile[data-idx="${idx}"]`); if(!tile) return;
    tile.classList.add(owner===0?'ownedP0':'ownedP1');
    if(game.mortgages[idx]) tile.classList.add('mortgaged');
  });

  grid.querySelectorAll('.ownerDot').forEach(dot=>{
    const idx=+dot.dataset.idx, owner=game.owners[idx];
    if(owner==null){ dot.style.display='none'; return; }
    dot.style.display='';
    dot.style.background = owner===0
      ?'linear-gradient(145deg,#ef4444,#f87171)'
      :'linear-gradient(145deg,#3b82f6,#60a5fa)';
  });

  updateDevMarkers();
}

/* Token layout */
export function positionTokens(){
  game.players.forEach((p,pid)=>{
    const tok=tokenEls[pid];
    const {cx,cy,w,h}=tileCenter(p.pos);

    let ox=0,oy=0;
    switch(sideOf(p.pos)){
      case'top':    oy= h*0.22; break;
      case'bottom': oy=-h*0.22; break;
      case'left':   ox= w*0.22; break;
      case'right':  ox=-w*0.22; break;
    }

    const stacked = game.players[0].pos===p.pos && game.players[1].pos===p.pos;
    const shift = stacked ? (pid===0?-6:6) : 0;

    tok.style.left=`calc(${cx+ox}% + ${shift}px)`;
    tok.style.top =`calc(${cy+oy}% + ${shift}px)`;
  });
}

/* Outpost / Colony markers */
export function updateDevMarkers(){
  $('grid').querySelectorAll('.devMarker').forEach(div=>{
    const idx=+div.dataset.idx, h=game.houses[idx];
    if(h===0){ div.innerHTML=''; return; }

    div.innerHTML='';
    if(h>=5){ div.append(`✴️×${h-4}`); } // Colony icon
    else{
      for(let i=0;i<h;i++){
        const span=document.createElement('span'); span.textContent='🛰️'; // Outpost icon
        if(i>0) span.style.marginTop='-10px';
        div.append(span);
      }
    }

    const side=sideOf(idx);
    div.style.position='absolute';
    div.style.fontSize='14px';
    div.style.lineHeight='1';
    if(side==='top'){
      Object.assign(div.style,{ bottom:'14px', left:'0', right:'0', textAlign:'center' });
    }else if(side==='bottom'){
      Object.assign(div.style,{ top:'14px', left:'0', right:'0', textAlign:'center' });
    }else if(side==='left'){
      Object.assign(div.style,{ right:'14px', top:'0', bottom:'0',
        display:'flex', flexDirection:'column', alignItems:'center' });
    }else{
      Object.assign(div.style,{ left:'14px', top:'0', bottom:'0',
        display:'flex', flexDirection:'column', alignItems:'center' });
    }
  });
}

/* Deep Space Station kitty label */
export function updateParkingPot(){
  const potEl = $('#fpPot');
  if (potEl) potEl.textContent = money(game.freeParkingPot);
}
