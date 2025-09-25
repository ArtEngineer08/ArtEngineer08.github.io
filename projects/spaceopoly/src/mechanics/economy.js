/*───────────────────────────────────────────────────────────┐
│ FILE: src/mechanics/economy.js                            │
└───────────────────────────────────────────────────────────*/
import { game } from '../state/gameState.js';
import { log, money }  from '../utils/dom.js';
import { updateSidebars } from '../ui/sidebar.js';
import { updateParkingPot } from '../ui/boardRender.js';

/* kitty helper */
export function addToPot(amt) {
  game.freeParkingPot += amt;
  log(`${money(amt)} added to Deep Space Station cache → now ${money(game.freeParkingPot)}.`);
  updateParkingPot();
}

/* primary helpers */
export function pay(p, amt, label = '') {
  p.cash -= amt;
  log(`${p.name} paid ${money(amt)}${label ? ' ('+label+')' : ''}.`);
  checkBankruptcy(p);
  updateSidebars();
}

export function receive(p, amt, label = '') {
  p.cash += amt;
  log(`${p.name} received ${money(amt)}${label ? ' ('+label+')' : ''}.`);
  updateSidebars();
}

export function transfer(from, to, amt, label = '') {
  from.cash -= amt;
  to.cash   += amt;
  log(`${from.name} paid ${to.name} ${money(amt)}${label ? ' ('+label+')' : ''}.`);
  checkBankruptcy(from);
  updateSidebars();
}

export function checkBankruptcy(p) {
  if (p.cash >= 0) return;
  game.over = true;
  const loser = p;
  const winner = game.players.find(pl => pl !== loser);
  log(`${loser.name} is bankrupt. ${winner.name} wins!`);
}
