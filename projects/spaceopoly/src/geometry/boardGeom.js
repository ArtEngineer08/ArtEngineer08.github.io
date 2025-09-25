/*───────────────────────────────────────────────────────────┐
│ FILE: src/geometry/boardGeom.js                           │
└───────────────────────────────────────────────────────────*/

/**
 * Pure geometry helpers for converting a Monopoly tile index (0-39)
 * into percentages that map neatly onto a square CSS grid.
 *
 *  – NO DOM ACCESS here
 *  – Keeps the maths in one place
 *  – If you ever change the board shape, change it here only
 */

const CORNER = (100 / 11) * 2;        // 2/11 ≈ 18.18 % per corner square
const EDGE   = (100 - 2 * CORNER) / 9; // the nine edge tiles per side

/** @param {number} i */
export function isCorner(i) {
  return i % 10 === 0;
}

/** Which side of the board a tile lives on */
export function sideOf(i) {
  if (isCorner(i))         { return 'corner'; }
  if (i > 0  && i < 10)    { return 'bottom'; }
  if (i > 10 && i < 20)    { return 'left'; }
  if (i > 20 && i < 30)    { return 'top'; }
  return 'right';
}

/**
 * Return a rect in percentages for the tile’s bounding box.
 * { x, y, w, h } where each value is 0-100 (percentage unit).
 */
export function tileRect(i) {
  // Bottom row  (0-10)
  if (i <= 10) {
    if (i === 0)  { return { x: 100 - CORNER, y: 100 - CORNER, w: CORNER, h: CORNER }; }
    if (i === 10) { return { x: 0,            y: 100 - CORNER, w: CORNER, h: CORNER }; }
    return { x: 100 - CORNER - i * EDGE, y: 100 - CORNER, w: EDGE, h: CORNER };
  }

  // Left column (11-20)
  if (i <= 20) {
    if (i === 20) { return { x: 0, y: 0, w: CORNER, h: CORNER }; }
    return { x: 0, y: 100 - CORNER - (i - 10) * EDGE, w: CORNER, h: EDGE };
  }

  // Top row (21-30)
  if (i <= 30) {
    if (i === 30) { return { x: 100 - CORNER, y: 0, w: CORNER, h: CORNER }; }
    return { x: CORNER + (i - 21) * EDGE, y: 0, w: EDGE, h: CORNER };
  }

  // Right column (31-39)
  return { x: 100 - CORNER, y: CORNER + (i - 31) * EDGE, w: CORNER, h: EDGE };
}

/**
 * Convenience to get the tile’s center in the same coordinate space.
 * Also returns w/h so the token renderer can offset within the tile.
 */
export function tileCenter(i) {
  const r = tileRect(i);
  return {
    cx: r.x + r.w / 2,
    cy: r.y + r.h / 2,
    w : r.w,
    h : r.h
  };
}