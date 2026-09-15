import { describe, it, expect } from 'vitest'
import { pageCountFor, pageSlice } from '../pagination'

describe('pageCountFor', () => {
  it('returns 1 for 0 items', () => {
    expect(pageCountFor(0, 10)).toBe(1)
  })

  it('returns the exact quotient when total is a multiple of pageSize', () => {
    expect(pageCountFor(20, 10)).toBe(2)
  })

  it('rounds up when there is a remainder', () => {
    expect(pageCountFor(11, 10)).toBe(2)
  })
})

describe('pageSlice', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  it('slices first, middle, and last pages', () => {
    expect(pageSlice(items, 1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(pageSlice(items, 2, 5)).toEqual([6, 7, 8, 9, 10])
    expect(pageSlice(items, 3, 5)).toEqual([11, 12])
  })

  it('returns an empty array for an out-of-range page', () => {
    expect(pageSlice(items, 10, 5)).toEqual([])
  })

  it('returns an empty array for page 0 (negative slice start)', () => {
    expect(pageSlice(items, 0, 5)).toEqual([])
  })
})
