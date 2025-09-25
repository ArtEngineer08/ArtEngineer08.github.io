/*───────────────────────────────────────────────────────────┐
│ FILE: src/mechanics/movement.js                           │
└───────────────────────────────────────────────────────────*/
import { BOARD }                               from '../constants.js';
import { game }                                from '../state/gameState.js';
import { rollAndShow, showDice }               from '../ui/dice.js';
import { positionTokens, updateParkingPot }    from '../ui/boardRender.js';
import { updateSidebars, refreshButtons }      from '../ui/sidebar.js';
import { pay, receive, addToPot }              from './economy.js';
import { landP, landRR, landUT, buyProperty }  from './properties.js';
import { drawCard }                            from './cards.js';
import { log, money }                          from '../utils/dom.js';
import { landFX, travelStepFX, tokenBloom }    from '../ui/sfx.js';

/* Pending Move / Teleport */
let pendingMove = null;
export function setPendingMove(pid, teleport) { pendingMove = { pid, teleport }; }
export function clearPendingMove()            { pendingMove = null; }
export function hasPendingMove()              { return pendingMove !== null; }
export function consumePendingMove()          { const m = pendingMove; pendingMove = null; return m; }

/* Action queue */
function ensureQueues() {
  if (!game.actions) game.actions = [[], []];
  if (!Array.isArray(game.actions[0])) game.actions[0] = [];
  if (!Array.isArray(game.actions[1])) game.actions[1] = [];
}
ensureQueues();

export function enqueue(pid, label, fn) {
  ensureQueues();
  game.actions[pid].push({ label, fn });
  refreshButtons();
}
export function hasAction(pid) { ensureQueues(); return game.actions[pid].length > 0; }
export function peekAction(pid){ ensureQueues(); return game.actions[pid][0] || null; }
export function runNextAction(pid) {
  ensureQueues();
  const a = game.actions[pid].shift();
  if (a) a.fn();
  refreshButtons();
  updateSidebars();
}

/* Instant move */
export function movePlayerDirect(pid, targetIdx, teleport = false) {
  const p = game.players[pid];
  p.pos   = targetIdx;
  positionTokens();
  if (!teleport) tileAction(pid);
  else           updateSidebars();
}

/* Roll & Deep Space handling */
export function rollTurn(pid) {
  game.current = pid;
  const p = game.players[pid];

  if (hasAction(pid)) {
    log(`Finish your pending actions first.`);
    refreshButtons();
    return;
  }

  if (p.jail) {
    const [a, b] = rollAndShow(pid);
    if (a === b) {
      p.jail = false; p.jailTurns = 0; p.doublesInRow = 0;
      log(`${p.name} rolled doubles and returns from Deep Space.`);
      moveBy(pid, a + b);
    } else {
      p.jailTurns += 1;
      log(`${p.name} did not roll doubles (${p.jailTurns}/3).`);
      if (p.jailTurns >= 3) {
        pay(p, 50, 'rescue fee after 3rd try');
        p.jail = false; p.jailTurns = 0;
        moveBy(pid, a + b);
      } else {
        refreshButtons();
      }
    }
    return;
  }

  const [a, b] = rollAndShow(pid);
  const doubles = a === b;

  if (doubles) {
    p.doublesInRow += 1;
    if (p.doublesInRow >= 3) {
      log(`${p.name} rolled three doubles → Lost in Space.`);
      goToJail(pid);
      refreshButtons();
      return;
    }
  } else {
    p.doublesInRow = 0;
  }

  moveBy(pid, a + b, doubles);
}

/* Movement */
function seqPath(start, steps){
  const out = [];
  for(let k=1;k<=steps;k++) out.push((start + k) % 40);
  return out;
}

export function moveBy(pid, steps, doubles = false) {
  const p   = game.players[pid];
  const old = p.pos;

  const crossedGo = (old + steps >= 40);
  if (crossedGo) {
    enqueue(pid, `Receive ${money(200)}`, () => receive(p, 200, 'passing Launch'));
  }

  const path = seqPath(old, steps);
  if (path.length === 0) { tileAction(pid); return; }

  game.animating = true; refreshButtons();

  let i = 0;
  function step(){
    const next = path[i];
    travelStepFX(pid, p.pos, next);
    p.pos = next;
    positionTokens();

    i++;
    if (i < path.length){
      setTimeout(step, 160);
    } else {
      tokenBloom(pid);
      game.animating = false; refreshButtons();
      tileAction(pid);
    }
  }
  step();
}

/* Landing actions */
export function tileAction(pid) {
  const p   = game.players[pid];
  const idx = p.pos;
  const t   = BOARD[idx].t;
  landFX(pid, idx);

  game.awaitingPurchase = null;

  switch (t) {
    case 'GO':
    case 'JAIL':
      break;

    case 'PARK': {
      if (game.freeParkingPot > 0) {
        const amt = game.freeParkingPot;
        enqueue(pid, `Collect Deep Space Station cache (${money(amt)})`, () => {
          receive(p, amt, 'Deep Space Station cache');
          log(`Deep Space Station cache collected. Pot resets to ${money(200)}.`);
          game.freeParkingPot = 200;
          updateParkingPot();
        });
      }
      break;
    }

    case 'GOTOJAIL':
      enqueue(pid, 'Lost in Space — to Deep Space', () => goToJail(pid));
      break;

    case 'TAX': {
      const cost = BOARD[idx].cost;
      enqueue(pid, `Pay ${money(cost)}`, () => {
        pay(p, cost, BOARD[idx].name);
        addToPot(cost);
      });
      break;
    }

    case 'P':  landP(pid, idx); break;
    case 'RR': landRR(pid, idx); break;
    case 'UT': landUT(pid, idx); break;

    case 'CH':   enqueue(pid, '📡 Mission Control', () => drawCard(pid, 'CHEST')); return;
    case 'CH?':  enqueue(pid, '💫 Nav. Alert!',      () => drawCard(pid, 'CHANCE')); return;
  }

  updateSidebars();
}

/* Deep Space helpers */
export function goToJail(pid) {
  const p = game.players[pid];
  p.pos = 10; p.jail = true; p.jailTurns = 0; p.doublesInRow = 0;
  positionTokens();
  log(`${p.name} is now Lost in Deep Space.`);
  updateSidebars();
}

export function payBail(pid) {
  const p = game.players[pid];
  if (!p.jail || p.cash < 50) return;
  pay(p, 50, 'rescue fee');
  p.jail = false; p.jailTurns = 0;
  updateSidebars();
}

export function useJailCard(pid) {
  const p = game.players[pid];
  if (!p.jail || p.gooj <= 0) return;
  p.gooj -= 1; p.jail = false; p.jailTurns = 0;
  log(`${p.name} used a Rescue Beacon.`);
  updateSidebars();
}

/* Manual end-turn */
export function endTurn() {
  game.awaitingPurchase = null;
  showDice(0, '-', '-'); showDice(1, '-', '-');
  log(`Turn ended (manual mode).`);
  updateSidebars();
}

/* re-export */
export { buyProperty } from './properties.js';
