export type ListStatusAction = 'retry' | 'show-all'

export type ListStatusMessage = {
  message: string
  actionLabel: string
  tone: 'muted' | 'error'
  action: ListStatusAction
}

export function getListStatusMessage(input: {
  listError: string | null
  filteredCount: number
  showFavouritesOnly: boolean
  favouriteCount: number
}): ListStatusMessage | null {
  if (input.listError) {
    return {
      message: input.listError,
      actionLabel: 'Retry',
      tone: 'error',
      action: 'retry',
    }
  }

  if (input.filteredCount > 0) return null

  if (input.showFavouritesOnly && input.favouriteCount === 0) {
    return {
      message: 'No liked planets yet.',
      actionLabel: 'Show all',
      tone: 'muted',
      action: 'show-all',
    }
  }

  return {
    message: 'No planets found.',
    actionLabel: 'Retry',
    tone: 'muted',
    action: 'retry',
  }
}
