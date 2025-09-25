/*───────────────────────────────────────────────────────────┐
│ FILE: src/utils/random.js                                 │
└───────────────────────────────────────────────────────────*/

/**
 * Fisher–Yates shuffle (mutates the input array).
 * @param {any[]} arr
 * @returns {any[]} the same array, shuffled
 */
export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Roll a single six-sided die.
 * @returns {number} integer 1-6
 */
export function rollDie() {
  return (Math.random() * 6 | 0) + 1;   // bitwise-OR 0 → int cast
}