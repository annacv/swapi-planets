import { describe, it, expect, beforeEach, vi } from 'vitest'
import { readStringList, writeStringList } from '../storage'

const TEST_KEY = '__test_storage_key__'

beforeEach(() => {
  localStorage.clear()
})

describe('readStringList / writeStringList', () => {
  it('round-trips valid data and returns [] for corrupt or non-array JSON', () => {
    writeStringList(TEST_KEY, ['a', 'b', 'c'])
    expect(readStringList(TEST_KEY)).toEqual(['a', 'b', 'c'])

    localStorage.setItem(TEST_KEY, '{not valid json')
    expect(readStringList(TEST_KEY)).toEqual([])

    localStorage.setItem(TEST_KEY, JSON.stringify({ a: 1 }))
    expect(readStringList(TEST_KEY)).toEqual([])

    localStorage.setItem(TEST_KEY, JSON.stringify(['a', 42, null, 'b']))
    expect(readStringList(TEST_KEY)).toEqual(['a', 'b'])
  })

  it('returns when setItem throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    try {
      expect(() => writeStringList(TEST_KEY, ['a', 'b'])).not.toThrow()
    } finally {
      vi.restoreAllMocks()
    }
  })
})
