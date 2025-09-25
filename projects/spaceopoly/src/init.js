/*───────────────────────────────────────────────────────────┐
│ FILE: src/init.js                                         │
└───────────────────────────────────────────────────────────*/
import { $ }                      from './utils/dom.js';
import { buildBoard }            from './ui/boardRender.js';
import { updateSidebars }        from './ui/sidebar.js';
import { game, resetGame }       from './state/gameState.js';
import { rollTurn,
         payBail, useJailCard,
         buyProperty }           from './mechanics/movement.js';
import { resetDecks }            from './mechanics/cards.js';
import { BOARD }                 from './constants.js';
import { showCtx }               from './ui/ctxMenu.js';
import { runNextAction } from './mechanics/movement.js';
import { propertyMenu }           from './mechanics/properties.js';

/**
 * Wire all buttons and set up a fresh game.
 */
export default function init() {
  // Buttons
  const rollBtns = [ $('p0Roll'), $('p1Roll') ];
  const buyBtns  = [ $('p0Buy'),  $('p1Buy')  ];
  const bailBtns = [ $('p0PayBail'), $('p1PayBail') ];
  const cardBtns = [ $('p0UseCard'), $('p1UseCard') ];

  rollBtns.forEach((btn, i) => btn.addEventListener('click', () => rollTurn(i)));
  buyBtns .forEach((btn, i) => btn.addEventListener('click', () => buyProperty(i)));
  bailBtns.forEach((btn, i) => btn.addEventListener('click', () => payBail(i)));
  cardBtns.forEach((btn, i) => btn.addEventListener('click', () => useJailCard(i)));

  // Build static board
  buildBoard();

  // Add context menu to property tiles on the board (gift / mortgage)
  // Note: sidebar.js attaches context to pills; this adds it to tiles.
  const grid = $('grid');
  grid.addEventListener('contextmenu', e => {
    const tileEl = e.target.closest('.tile');
    if (!tileEl) { return; }
    const idx = +tileEl.dataset.idx;
    if (Number.isNaN(idx)) { return; }
    const t = BOARD[idx].t;
    if (t !== 'P' && t !== 'RR' && t !== 'UT') { return; }

    e.preventDefault();
    const owner = window._game?.owners?.[idx] ?? null; // safe if not set yet
    // fallback simple message; full mortgage/gift menu is available on property pills
    propertyMenu(game.current, idx, [e.clientX, e.clientY]);
  });

  // Kick off first game
  newGame();
}

/**
 * Start a brand new game (state + decks + UI).
 */
function newGame() {
  resetGame();
  resetDecks();

  // expose game for optional debugging from console
  window._game = game;

  // Build board again to ensure a clean slate (owner dots, tokens already handled in module)
  // buildBoard() already called at init; tokens and ownership will be updated via updateSidebars.
  updateSidebars();
}