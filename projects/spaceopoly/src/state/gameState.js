/*───────────────────────────────────────────────────────────┐
│ FILE: src/state/gameState.js                              │
└───────────────────────────────────────────────────────────*/
import { makePlayer } from './player.js';

/**
 * Central mutable game state.
 * - owners[m]       : null | 0 | 1          → owner of tile m
 * - mortgages[m]    : boolean               → is tile m mortgaged
 * - houses[m]       : 0..4 houses, 5 = hotel
 * - actions[pid][]  : queued UI-driven steps for player pid
 * - awaitingPurchase: index | null          → unowned tile that current player can buy
 * - current         : 0 | 1                 → whose turn it is
 * - over            : boolean               → game finished
 * - freeParkingPot  : number                → house-rule kitty (starts at 200)
 */
export const game = {
  players  : [makePlayer('Player 1'), makePlayer('Player 2')],

  owners    : Array(40).fill(null),   // null | 0 | 1
  mortgages : Array(40).fill(false),
  houses    : Array(40).fill(0),      // 0-4 houses, 5 = hotel

  freeParkingPot : 200,               // house-rule kitty

  current   : 0,
  awaitingPurchase : null,
  over      : false,

  // per-player action queues (FIFO). Each item: { label:string, fn:() => void }
  actions   : [[], []]
};

/**
 * Reset all game state to a brand-new game.
 * (Keeps the same object/array identities that other modules hold references to.)
 */
export function resetGame() {
  game.players = [makePlayer('Player 1'), makePlayer('Player 2')];

  // board state
  game.owners.fill(null);
  game.mortgages.fill(false);
  game.houses.fill(0);

  // meta state
  game.freeParkingPot   = 200;
  game.animating       = false;
  game.current          = 0;
  game.awaitingPurchase = null;
  game.over             = false;

  // action queues: clear in place
  game.actions[0].length = 0;
  game.actions[1].length = 0;
}