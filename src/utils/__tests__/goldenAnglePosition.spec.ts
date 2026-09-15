import { describe, it, expect } from 'vitest'
import { goldenAnglePosition } from '../goldenAnglePosition'

describe('goldenAnglePosition', () => {
  it('returns finite x/y in the 0–1 range, including for count=0', () => {
    const pos = goldenAnglePosition(5, 60)
    expect(pos.x).toBeGreaterThanOrEqual(0)
    expect(pos.x).toBeLessThanOrEqual(1)
    expect(pos.y).toBeGreaterThanOrEqual(0)
    expect(pos.y).toBeLessThanOrEqual(1)

    const edge = goldenAnglePosition(0, 0)
    expect(Number.isFinite(edge.x)).toBe(true)
    expect(Number.isFinite(edge.y)).toBe(true)
  })
})
