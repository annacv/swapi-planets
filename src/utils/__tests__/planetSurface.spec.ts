import { describe, it, expect } from 'vitest'
import {
  terrainTokens,
  colorForTerrain,
  parseSurfaceWater,
  planetSurfaceBackground,
} from '../planetSurface'

describe('terrainTokens', () => {
  it('splits, trims, and lowercases comma-separated tokens', () => {
    expect(terrainTokens('Grasslands, Mountains, Jungle')).toEqual([
      'grasslands',
      'mountains',
      'jungle',
    ])
  })

  it('filters empty tokens and returns [] for a blank string', () => {
    expect(terrainTokens('desert, , forests')).toEqual(['desert', 'forests'])
    expect(terrainTokens('')).toEqual([])
  })
})

describe('colorForTerrain', () => {
  it('returns the mapped color for a known token', () => {
    expect(colorForTerrain('desert')).toBe('#e0b15a')
  })

  it('returns the grey fallback for an unknown token', () => {
    expect(colorForTerrain('lava_fields_of_doom')).toBe('#c8c8c8')
  })
})

describe('parseSurfaceWater', () => {
  it('parses a valid number, including 0', () => {
    expect(parseSurfaceWater('40')).toBe(40)
    expect(parseSurfaceWater('0')).toBe(0)
  })

  it('returns null for NaN or negative values', () => {
    expect(parseSurfaceWater('unknown')).toBeNull()
    expect(parseSurfaceWater('-5')).toBeNull()
  })

  it('clamps values above 100 to 100', () => {
    expect(parseSurfaceWater('150')).toBe(100)
  })
})

describe('planetSurfaceBackground', () => {
  it('produces an all-water gradient when surface_water is 100', () => {
    expect(planetSurfaceBackground('desert', '100')).toBe(
      'linear-gradient(155deg, #1a6fb5 0%, #1a6fb5 100%)',
    )
  })

  it('produces a land-only gradient when surface_water is 0', () => {
    expect(planetSurfaceBackground('desert', '0')).toBe(
      'linear-gradient(155deg, #e0b15a 0%, #e0b15a 100%)',
    )
  })

  it('produces a mixed gradient with multiple terrains and water', () => {
    expect(planetSurfaceBackground('desert, forests', '30')).toBe(
      'linear-gradient(155deg, #e0b15a 0%, #1e7a3a 70%, #1a6fb5 100%)',
    )
  })

  it('uses the grey fallback when terrain is empty', () => {
    expect(planetSurfaceBackground('', '50')).toContain('#c8c8c8')
  })
})
