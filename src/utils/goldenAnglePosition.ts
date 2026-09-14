/** Golden angle in radians: π(3 − √5) ≈ 137.5°. Each point is rotated by this so they don’t share the same ray. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/**
 * Normalized (0–1) x/y for the `index`th of `count` points on a golden-angle spiral.
 * Map dots and the tooltip use the same point so they stay aligned.
 */
export function goldenAnglePosition(index: number, count: number) {
  const total = Math.max(count, 1)
  const radius = Math.sqrt((index + 0.5) / total) * 0.4
  const angle = index * GOLDEN_ANGLE
  return {
    x: 0.48 + Math.cos(angle) * radius,
    y: 0.52 + Math.sin(angle) * radius,
  }
}
