import { describe, it, expect } from 'vitest'
import { personIdFromUrl, planetIdFromUrl } from '../swapi'

describe('planetIdFromUrl', () => {
  it('extracts the id from valid SWAPI planet URLs', () => {
    expect(planetIdFromUrl('https://swapi.dev/api/planets/1/')).toBe('1')
    expect(planetIdFromUrl('https://swapi.dev/api/planets/42')).toBe('42')
  })

  it('throws on malformed or non-planet URLs', () => {
    expect(() => planetIdFromUrl('https://swapi.dev/api/planets/')).toThrow(
      'Could not extract planet id',
    )
    expect(() => planetIdFromUrl('https://swapi.dev/api/people/1/')).toThrow(
      'Could not extract planet id',
    )
  })
})

describe('personIdFromUrl', () => {
  it('returns the id for a people URL', () => {
    expect(personIdFromUrl('https://swapi.dev/api/people/1/')).toBe('1')
    expect(personIdFromUrl('https://swapi.dev/api/people/42')).toBe('42')
  })

  it('returns null for a malformed URL and does not throw', () => {
    expect(personIdFromUrl('https://swapi.dev/api/people/')).toBeNull()
    expect(personIdFromUrl('https://swapi.dev/api/planets/1/')).toBeNull()
    expect(personIdFromUrl('not-a-url')).toBeNull()
  })
})
