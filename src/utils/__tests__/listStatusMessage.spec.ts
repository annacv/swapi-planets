import { describe, it, expect } from 'vitest'
import { getListStatusMessage } from '../listStatusMessage'

describe('getListStatusMessage', () => {
  it('returns an error message when listError is set', () => {
    expect(
      getListStatusMessage({
        listError: 'Network failure',
        filteredCount: 0,
        showFavouritesOnly: false,
        favouriteCount: 0,
      }),
    ).toEqual({
      message: 'Network failure',
      actionLabel: 'Retry',
      tone: 'error',
      action: 'retry',
    })
  })

  it('returns null when filteredCount > 0', () => {
    expect(
      getListStatusMessage({
        listError: null,
        filteredCount: 5,
        showFavouritesOnly: false,
        favouriteCount: 0,
      }),
    ).toBeNull()
  })

  it('returns "No liked planets yet." when favourites-only and favouriteCount is 0', () => {
    expect(
      getListStatusMessage({
        listError: null,
        filteredCount: 0,
        showFavouritesOnly: true,
        favouriteCount: 0,
      }),
    ).toEqual({
      message: 'No liked planets yet.',
      actionLabel: 'Show all',
      tone: 'muted',
      action: 'show-all',
    })
  })

  it('returns "No planets found." otherwise', () => {
    expect(
      getListStatusMessage({
        listError: null,
        filteredCount: 0,
        showFavouritesOnly: false,
        favouriteCount: 0,
      }),
    ).toEqual({
      message: 'No planets found.',
      actionLabel: 'Retry',
      tone: 'muted',
      action: 'retry',
    })
  })
})
