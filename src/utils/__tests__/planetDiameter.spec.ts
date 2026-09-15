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
  it('parses a valid number string', () => {
    expect(parseDiameter('12500')).toBe(12500)
  })

  it('returns null for non-finite values', () => {
    expect(parseDiameter('unknown')).toBeNull()
  })

  it('returns null for non-positive values', () => {
    expect(parseDiameter('0')).toBeNull()
  })
})

describe('maxKnownDiameter', () => {
  it('returns the largest valid diameter and ignores invalid ones', () => {
    const planets = [stubPlanet('unknown'), stubPlanet('1000'), stubPlanet('5000'), stubPlanet('0')]
    expect(maxKnownDiameter(planets)).toBe(5000)
  })

  it('returns 0 for an empty array', () => {
    expect(maxKnownDiameter([])).toBe(0)
  })
})

describe('circleSizePx', () => {
  it('scales by the square root of the diameter ratio', () => {
    expect(circleSizePx('10000', 10000)).toBe(MAX_CIRCLE_PX)
    expect(circleSizePx('2500', 10000)).toBe(Math.round(Math.sqrt(2500 / 10000) * MAX_CIRCLE_PX))
  })

  it('returns MIN_CIRCLE_PX when diameter is unknown', () => {
    expect(circleSizePx('unknown', 10000)).toBe(MIN_CIRCLE_PX)
  })

  it('returns MIN_CIRCLE_PX when maxDiameter is not positive', () => {
    expect(circleSizePx('5000', 0)).toBe(MIN_CIRCLE_PX)
  })

  it('accepts a custom maxCirclePx', () => {
    expect(circleSizePx('10000', 10000, 200)).toBe(200)
  })
})
