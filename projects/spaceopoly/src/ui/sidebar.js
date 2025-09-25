/*───────────────────────────────────────────────────────────┐
│ FILE: src/ui/sidebar.js                                   │
└───────────────────────────────────────────────────────────*/
import { $, el, money, log }    from '../utils/dom.js';
import { COLORS, BOARD }        from '../constants.js';
import { game }                 from '../state/gameState.js';
import { applyOwnershipStyles } from './boardRender.js';
import { showCtx }              from './ctxMenu.js';
import { propertyMenu }         from '../mechanics/properties.js';
import * as movement            from '../mechanics/movement.js';
import { hasAction, peekAction, runNextAction } from '../mechanics/movement.js';

const cashEls    = [ $('cash0'), $('cash1') ];
const statusEls  = [ $('status0'), $('status1') ];
const propLists  = [ $('props0'),  $('props1')  ];

const rollBtns   = [ $('p0Roll'),  $('p1Roll')  ];
const buyBtns    = [ $('p0Buy'),   $('p1Buy')   ];
const bailBtns   = [ $('p0PayBail'), $('p1PayBail') ];
const cardBtns   = [ $('p0UseCard'), $('p1UseCard') ];

const actionBtns = [ $('p0Act'), $('p1Act') ];
actionBtns.forEach((btn, pid) => {
  if (!btn) return;
  if (btn.dataset.boundAct) return;
  btn.dataset.boundAct = '1';
  btn.addEventListener('click', () => runNextAction(pid));
});

[
  $('pCol0')?.querySelector('.who'),
  $('pCol1')?.querySelector('.who')
].forEach((whoEl, pid) => {
  if (!whoEl) return;
  whoEl.addEventListener('contextmenu', e => {
    e.preventDefault();
    showCtx([
      { label:'Move Player to…',     action:() => movement.setPendingMove(pid,false) },
      { label:'Teleport Player to…', action:() => movement.setPendingMove(pid,true)  }
    ], e.clientX, e.clientY);
  });
});

export function updateSidebars() {
  document.querySelectorAll('#p0End,#p1End').forEach(btn => btn.remove());

  game.players.forEach((p, pid) => {
    cashEls[pid].textContent = money(p.cash);

    // Status: exploring vs lost
    const tileName = BOARD[p.pos].name;
    let suffix = '';
    if (p.jail) suffix = ' (Lost in Deep Space)';
    else if (p.pos === 10) suffix = ' (Exploring Deep Space)';

    statusEls[pid].textContent = `Position: ${tileName}${suffix}`;

    const list = propLists[pid];
    list.innerHTML = '';

    p.props.forEach(idx => {
      const pill = el('span', {
        className: 'pill',
        textContent: BOARD[idx].name,
        dataset: { idx }
      });

      if (BOARD[idx].color) {
        pill.style.background = COLORS[BOARD[idx].color];
        pill.style.color = '#000';
      }
      if (game.mortgages[idx]) pill.classList.add('mortgaged');

      pill.addEventListener('contextmenu', e => {
        e.preventDefault();
        propertyMenu(pid, idx, [e.clientX, e.clientY]);
      });

      list.append(pill);
    });
  });

  applyOwnershipStyles();
  refreshButtons();
}

export function refreshButtons() {
  [0,1].forEach(pid => {
    const qPending = hasAction(pid);
    const head     = peekAction(pid);

    rollBtns[pid].disabled = qPending || game.animating;

    const canBuy = (game.awaitingPurchase != null &&
                    game.owners[game.awaitingPurchase] == null &&
                    !qPending);
    buyBtns[pid].disabled = !canBuy || game.animating;

    bailBtns[pid].disabled = !game.players[pid].jail;
    cardBtns[pid].disabled = !(game.players[pid].jail && game.players[pid].gooj > 0);

    if (actionBtns[pid]) {
      actionBtns[pid].textContent = qPending ? head.label : 'Action';
      actionBtns[pid].disabled    = !qPending;
    }
  });
}

/* Cash context-menu */
cashEls.forEach((elCash, pid) => {
  if (!elCash) return;

  elCash.addEventListener('contextmenu', e => {
    e.preventDefault();

    const me = pid, other = 1 - pid;

    const give = (a) => {
      if (game.players[me].cash < a) return;
      game.players[me].cash -= a;
      game.players[other].cash += a;
      log(`${game.players[me].name} gave ${money(a)} to ${game.players[other].name}.`);
      updateSidebars();
    };

    const payBank = a => {
      if (game.players[me].cash < a) return;
      game.players[me].cash -= a;
      log(`${game.players[me].name} paid ${money(a)} to Bank.`);
      updateSidebars();
    };

    const collect = a => {
      game.players[me].cash += a;
      log(`${game.players[me].name} collected ${money(a)} from Bank.`);
      updateSidebars();
    };

    showCtx([
      { label:`Give ${money(50)} to ${game.players[other].name}`, action:() => give(50) },
      { label:`Give ${money(100)} to ${game.players[other].name}`,action:() => give(100) },
      { label:'Give custom…', action:() => {
          const v = parseInt(prompt('Amount to give:'), 10) || 0;
          if (v > 0) give(v);
        } },
      { label:'—' },
      { label:`Pay ${money(50)} to Bank`,  action:() => payBank(50)  },
      { label:`Pay ${money(100)} to Bank`, action:() => payBank(100) },
      { label:'Pay custom…',      action:() => {
          const v = parseInt(prompt('Pay amount:'), 10) || 0;
          if (v > 0) payBank(v);
        } },
      { label:`Collect ${money(50)} from Bank`,  action:() => collect(50)  },
      { label:`Collect ${money(100)} from Bank`, action:() => collect(100) },
      { label:'Collect custom…',        action:() => {
          const v = parseInt(prompt('Collect amount:'), 10) || 0;
          if (v > 0) collect(v);
        } }
    ], e.clientX, e.clientY);
  });
});
