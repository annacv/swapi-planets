import { browsePlanetId } from './browsePlanet'

/** Left = back/previous. Right = next/detail. */
export type PageSlideDirection = 'left' | 'right'

let pendingPageSlide: PageSlideDirection | null = null

/** Record the slide for the navigation that is about to start (in-app link clicks). */
export function setPageSlide(direction: PageSlideDirection): void {
  pendingPageSlide = direction
}

export function consumePageSlideFromClick(): PageSlideDirection | null {
  const direction = pendingPageSlide
  pendingPageSlide = null
  return direction
}

/** Fallback when the user did not click an in-app link (browser back/forward). */
export function pageSlideDirection({
  toName,
  fromName,
  toPlanetId,
  fromPlanetId,
  orderedPlanetIds = [],
}: {
  toName: string | symbol | undefined | null
  fromName: string | symbol | undefined | null
  toPlanetId?: string
  fromPlanetId?: string
  orderedPlanetIds?: string[]
}): PageSlideDirection {
  if (toName === 'planets' && (fromName === 'planet-detail' || fromName === 'not-found')) {
    return 'left'
  }

  if (fromName === 'planet-detail' && toName === 'planet-detail' && fromPlanetId && toPlanetId) {
    if (browsePlanetId(orderedPlanetIds, fromPlanetId, 'previous') === toPlanetId) return 'left'
    if (browsePlanetId(orderedPlanetIds, fromPlanetId, 'next') === toPlanetId) return 'right'
  }

  return 'right'
}
