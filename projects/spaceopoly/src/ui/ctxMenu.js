/*───────────────────────────────────────────────────────────┐
│ FILE: src/ui/ctxMenu.js                                   │
└───────────────────────────────────────────────────────────*/
import { $, el } from '../utils/dom.js';

const ctx = $('ctx');

export function hideCtx() {
  ctx.style.display = 'none';
  ctx.innerHTML     = '';
}

export function showCtx(items, x, y) {
  ctx.innerHTML = '';

  items.forEach(({ label, action = () => {}, disabled = false }) => {
    if (label === '—') {
      ctx.append(el('hr', {
        style:'border:none;height:1px;background:rgba(255,255,255,.15);margin:4px 0'
      }));
      return;
    }
    const btn = el('button', { textContent: label });
    if (disabled) {
      btn.disabled = true;
      btn.style.opacity = 0.5;
      btn.style.cursor  = 'not-allowed';
    } else {
      btn.onclick = () => { hideCtx(); action(); };
    }
    ctx.append(btn);
  });

  ctx.style.left   = `${x}px`;
  ctx.style.top    = `${y}px`;
  ctx.style.display = 'block';

  // Clamp inside viewport after display so width/height are measurable
  const r = ctx.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  let left = x, top = y;
  if (left + r.width  > vw) left = vw - r.width  - 8;
  if (top  + r.height > vh) top  = vh - r.height - 8;
  if (left < 8) left = 8;
  if (top  < 8) top  = 8;
  ctx.style.left = `${left}px`;
  ctx.style.top  = `${top}px`;
}

document.addEventListener('click', e => {
  if (!e.target.closest('.ctxMenu')) { hideCtx(); }
});