import { describe, it, expect } from 'vitest'
import { pageCountFor, pageSlice } from '../pagination'

describe('pageCountFor', () => {
  it('computes correct page count for zero, exact, and remainder cases', () => {
    expect(pageCountFor(0, 10)).toBe(1)
    expect(pageCountFor(20, 10)).toBe(2)
    expect(pageCountFor(11, 10)).toBe(2)
  })
})

describe('pageSlice', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

  it('returns the correct slice for each page and empty for out-of-range', () => {
    expect(pageSlice(items, 1, 5)).toEqual([1, 2, 3, 4, 5])
    expect(pageSlice(items, 2, 5)).toEqual([6, 7, 8, 9, 10])
    expect(pageSlice(items, 3, 5)).toEqual([11, 12])
    expect(pageSlice(items, 10, 5)).toEqual([])
  })
})
