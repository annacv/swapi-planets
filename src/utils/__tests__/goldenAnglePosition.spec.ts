import { describe, it, expect } from 'vitest'
import { goldenAnglePosition } from '../goldenAnglePosition'

describe('goldenAnglePosition', () => {
  it('returns x and y in the 0–1 range', () => {
    const pos = goldenAnglePosition(5, 60)
    expect(pos.x).toBeGreaterThanOrEqual(0)
    expect(pos.x).toBeLessThanOrEqual(1)
    expect(pos.y).toBeGreaterThanOrEqual(0)
    expect(pos.y).toBeLessThanOrEqual(1)
  })

  it('does not crash when count is 0', () => {
    const pos = goldenAnglePosition(0, 0)
    expect(Number.isFinite(pos.x)).toBe(true)
    expect(Number.isFinite(pos.y)).toBe(true)
  })
})
