import { describe, it, expect } from 'vitest'
import type { SwapiPlanet } from '@/api/types'
import {
  parseDiameter,
  maxKnownDiameter,
  circleSizePx,
  MIN_CIRCLE_PX,
  MAX_CIRCLE_PX,
} from '../planetDiameter'

function stubPlanet(diameter: string): SwapiPlanet {
  return { diameter } as SwapiPlanet
}

describe('parseDiameter', () => {
  it('parses valid numbers and returns null for unknown or non-positive', () => {
    expect(parseDiameter('12500')).toBe(12500)
    expect(parseDiameter('unknown')).toBeNull()
    expect(parseDiameter('0')).toBeNull()
  })
})

describe('maxKnownDiameter', () => {
  it('returns the largest valid diameter, ignoring invalid values and empty arrays', () => {
    expect(
      maxKnownDiameter([
        stubPlanet('unknown'),
        stubPlanet('1000'),
        stubPlanet('5000'),
        stubPlanet('0'),
      ]),
    ).toBe(5000)
    expect(maxKnownDiameter([])).toBe(0)
  })
})

describe('circleSizePx', () => {
  it('scales by sqrt ratio and falls back to MIN_CIRCLE_PX for unknown or zero maxDiameter', () => {
    expect(circleSizePx('10000', 10000)).toBe(MAX_CIRCLE_PX)
    expect(circleSizePx('2500', 10000)).toBe(Math.round(Math.sqrt(0.25) * MAX_CIRCLE_PX))
    expect(circleSizePx('unknown', 10000)).toBe(MIN_CIRCLE_PX)
    expect(circleSizePx('5000', 0)).toBe(MIN_CIRCLE_PX)
  })
})
