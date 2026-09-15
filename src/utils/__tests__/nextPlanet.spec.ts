import { describe, it, expect } from 'vitest'
import { nextPlanetId } from '../nextPlanet'

describe('nextPlanetId', () => {
  it('returns the following id, wraps at the end, and is null when there is no next', () => {
    expect(nextPlanetId(['1', '2', '3'], '1')).toBe('2')
    expect(nextPlanetId(['1', '2', '3'], '3')).toBe('1')
    expect(nextPlanetId(['1'], '1')).toBeNull()
    expect(nextPlanetId(['1', '2'], '9')).toBeNull()
    expect(nextPlanetId([], '1')).toBeNull()
  })
})
