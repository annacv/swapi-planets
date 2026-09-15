import { describe, it, expect, beforeEach } from 'vitest'
import { readStringList, writeStringList } from '../storage'

const TEST_KEY = '__test_storage_key__'

beforeEach(() => {
  localStorage.clear()
})

describe('readStringList', () => {
  it('returns an empty array when the key does not exist', () => {
    expect(readStringList(TEST_KEY)).toEqual([])
  })

  it('returns a valid JSON array of strings', () => {
    localStorage.setItem(TEST_KEY, JSON.stringify(['a', 'b', 'c']))
    expect(readStringList(TEST_KEY)).toEqual(['a', 'b', 'c'])
  })

  it('returns an empty array for corrupt or non-array JSON', () => {
    localStorage.setItem(TEST_KEY, '{not valid json')
    expect(readStringList(TEST_KEY)).toEqual([])

    localStorage.setItem(TEST_KEY, JSON.stringify({ a: 1 }))
    expect(readStringList(TEST_KEY)).toEqual([])
  })

  it('filters out non-string items', () => {
    localStorage.setItem(TEST_KEY, JSON.stringify(['a', 42, null, 'b']))
    expect(readStringList(TEST_KEY)).toEqual(['a', 'b'])
  })
})

describe('writeStringList', () => {
  it('round-trips through readStringList', () => {
    writeStringList(TEST_KEY, ['x', 'y', 'z'])
    expect(readStringList(TEST_KEY)).toEqual(['x', 'y', 'z'])
  })
})
