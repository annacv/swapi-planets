import { describe, it, expect } from 'vitest'
import { browsePlanetId } from '../browsePlanet'

describe('browsePlanetId', () => {
  it('returns the following id, wraps at the end, and is null when there is no next', () => {
    expect(browsePlanetId(['1', '2', '3'], '1', 'next')).toBe('2')
    expect(browsePlanetId(['1', '2', '3'], '3', 'next')).toBe('1')
    expect(browsePlanetId(['1'], '1', 'next')).toBeNull()
    expect(browsePlanetId(['1', '2'], '9', 'next')).toBeNull()
    expect(browsePlanetId([], '1', 'next')).toBeNull()
  })

  it('returns the preceding id, wraps at the start, and is null when there is no previous', () => {
    expect(browsePlanetId(['1', '2', '3'], '2', 'previous')).toBe('1')
    expect(browsePlanetId(['1', '2', '3'], '1', 'previous')).toBe('3')
    expect(browsePlanetId(['1'], '1', 'previous')).toBeNull()
    expect(browsePlanetId(['1', '2'], '9', 'previous')).toBeNull()
    expect(browsePlanetId([], '1', 'previous')).toBeNull()
  })
})
