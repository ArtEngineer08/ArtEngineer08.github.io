/*───────────────────────────────────────────────────────────┐
│ FILE: src/state/player.js                                 │
└───────────────────────────────────────────────────────────*/

/**
 * Factory that returns a fresh player object.
 * Keeping it as data (not a class) keeps serialization simple.
 */
export function makePlayer(name = '') {
  return {
    name,
    cash        : 1500,
    pos         : 0,     // board index (0 = GO)
    jail        : false,
    jailTurns   : 0,
    doublesInRow: 0,

    /* property bookkeeping */
    props   : [],        // tile indices the player owns
    rr      : 0,         // number of railroads
    ut      : 0,         // number of utilities
    gooj    : 0          // Get-Out-Of-Jail-Free cards
  };
}