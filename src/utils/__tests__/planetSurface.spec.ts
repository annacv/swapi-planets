import { describe, it, expect } from 'vitest'
import { parseSurfaceWater, planetSurfaceBackground } from '../planetSurface'

describe('parseSurfaceWater', () => {
  it('parses valid values, rejects invalid, and clamps above 100', () => {
    expect(parseSurfaceWater('40')).toBe(40)
    expect(parseSurfaceWater('0')).toBe(0)
    expect(parseSurfaceWater('unknown')).toBeNull()
    expect(parseSurfaceWater('-5')).toBeNull()
    expect(parseSurfaceWater('150')).toBe(100)
  })
})

describe('planetSurfaceBackground', () => {
  it('produces correct gradients for water-only, land-only, mixed, and empty terrain', () => {
    expect(planetSurfaceBackground('desert', '100')).toBe(
      'linear-gradient(155deg, #1a6fb5 0%, #1a6fb5 100%)',
    )
    expect(planetSurfaceBackground('desert', '0')).toBe(
      'linear-gradient(155deg, #e0b15a 0%, #e0b15a 100%)',
    )
    expect(planetSurfaceBackground('desert, forests', '30')).toBe(
      'linear-gradient(155deg, #e0b15a 0%, #1e7a3a 70%, #1a6fb5 100%)',
    )
    expect(planetSurfaceBackground('', '50')).toContain('#c8c8c8')
  })
})
