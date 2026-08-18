/**
 * @typedef {{x: number, y: number}} Position
 */

/**
 * Generates a normalized vector representing the direction between 2 positions
 * @param {Position} a
 * @param {Position} b
 */
export function normalVec(a, b) {
  return {
    x: (b.x - a.x) / Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2),
    y: (b.y - a.y) / Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2),
  };
}

/**
 * Find the distance between 2 points
 * @param {Position} a
 * @param {Position} b
 */
export function distanceSquared(a, b) {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}
