/*───────────────────────────────────────────────────────────┐
│ FILE: src/ui/dice.js                                      │
└───────────────────────────────────────────────────────────*/
import { $, el }   from '../utils/dom.js';
import { rollDie } from '../utils/random.js';
import { diceRoll } from './sfx.js';

/* dice boxes are static in DOM */
const diceBoxes = [ $('dice0'), $('dice1') ];

/* Centers for a 3×3 grid inside the die face (percent units) */
const POS = [25, 50, 75];

/* Pip layouts using (row, col) indices into POS */
const FACE = {
  1: [[1,1]],
  2: [[0,0],[2,2]],
  3: [[0,0],[1,1],[2,2]],
  4: [[0,0],[0,2],[2,0],[2,2]],
  5: [[0,0],[0,2],[1,1],[2,0],[2,2]],
  6: [[0,0],[1,0],[2,0],[0,2],[1,2],[2,2]],
};

/**
 * Render pips inside a <div class="die"> element.
 * Positions are specified as centers; CSS should include:
 * .pip { position:absolute; transform: translate(-50%, -50%); }
 * @param {HTMLElement} dieEl
 * @param {number} n  – value 1-6
 */
function drawPips(dieEl, n) {
  dieEl.innerHTML = '';
  const layout = FACE[n];
  if (!layout) return;

  layout.forEach(([r, c]) => {
    const pip = el('span', { className: 'pip' });
    pip.style.top  = `${POS[r]}%`;
    pip.style.left = `${POS[c]}%`;
    dieEl.append(pip);
  });
}

/**
 * Show two dice for the given player.
 * Use '-' for a/b to clear box (no dice on screen).
 * @param {number} pid  – 0 or 1
 * @param {number|string} a
 * @param {number|string} b
 */
export function showDice(pid, a, b) {
  const box = diceBoxes[pid];
  if (!box) return;

  box.innerHTML = '';
  if (a === '-' && b === '-') return;

  [a, b].forEach(v => {
    const die = el('div', { className: 'die' });
    drawPips(die, Number(v));
    box.append(die);
  });
}

/**
 * Convenience wrapper: roll two dice & render them.
 * @param {number} pid
 * @returns {[number,number]} the two dice
 */
export function rollAndShow(pid) { diceRoll();
  const a = rollDie();
  const b = rollDie();
  showDice(pid, a, b);
  return [a, b];
}