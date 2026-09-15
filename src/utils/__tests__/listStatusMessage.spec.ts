import { describe, it, expect } from 'vitest'
import { getListStatusMessage } from '../listStatusMessage'

describe('getListStatusMessage', () => {
  it('returns error status when listError is set', () => {
    const result = getListStatusMessage({
      listError: 'Network failure',
      filteredCount: 0,
      showFavouritesOnly: false,
      favouriteCount: 0,
    })
    expect(result).toEqual({
      message: 'Network failure',
      actionLabel: 'Retry',
      tone: 'error',
      action: 'retry',
    })
  })

  it('returns null when there are results to show', () => {
    expect(
      getListStatusMessage({
        listError: null,
        filteredCount: 5,
        showFavouritesOnly: false,
        favouriteCount: 0,
      }),
    ).toBeNull()
  })

  it('returns the correct empty-state message for favourites vs search', () => {
    expect(
      getListStatusMessage({
        listError: null,
        filteredCount: 0,
        showFavouritesOnly: true,
        favouriteCount: 0,
      }),
    ).toMatchObject({ message: 'No liked planets yet.', action: 'show-all' })

    expect(
      getListStatusMessage({
        listError: null,
        filteredCount: 0,
        showFavouritesOnly: false,
        favouriteCount: 0,
      }),
    ).toMatchObject({ message: 'No planets found.', action: 'retry' })
  })
})
