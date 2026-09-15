import { describe, it, expect } from 'vitest'
import { planetIdFromUrl } from '../swapi'

describe('planetIdFromUrl', () => {
  it('extracts the id from a valid SWAPI planet URL', () => {
    expect(planetIdFromUrl('https://swapi.dev/api/planets/1/')).toBe('1')
  })

  it('extracts the id when the trailing slash is missing', () => {
    expect(planetIdFromUrl('https://swapi.dev/api/planets/42')).toBe('42')
  })

  it('extracts multi-digit ids', () => {
    expect(planetIdFromUrl('https://swapi.dev/api/planets/123/')).toBe('123')
  })

  it('throws on a malformed URL without a numeric id', () => {
    expect(() => planetIdFromUrl('https://swapi.dev/api/planets/')).toThrow(
      'Could not extract planet id from URL',
    )
  })

  it('throws on an unrelated URL', () => {
    expect(() => planetIdFromUrl('https://swapi.dev/api/people/1/')).toThrow(
      'Could not extract planet id from URL',
    )
  })

  it('throws on an empty string', () => {
    expect(() => planetIdFromUrl('')).toThrow('Could not extract planet id from URL')
  })
})
