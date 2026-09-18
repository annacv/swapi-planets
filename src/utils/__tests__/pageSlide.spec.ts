import { describe, it, expect } from 'vitest'

import { consumePageSlideFromClick, pageSlideDirection, setPageSlide } from '../pageSlide'

describe('pageSlideDirection', () => {
  const ids = ['1', '2', '3']

  it('slides right from the list to a detail page, and left when going back', () => {
    expect(
      pageSlideDirection({ fromName: 'planets', toName: 'planet-detail', toPlanetId: '1' }),
    ).toBe('right')
    expect(
      pageSlideDirection({ fromName: 'planet-detail', toName: 'planets', fromPlanetId: '1' }),
    ).toBe('left')
  })

  it('slides right to the next planet and left to the previous, including wrap', () => {
    expect(
      pageSlideDirection({
        fromName: 'planet-detail',
        toName: 'planet-detail',
        fromPlanetId: '1',
        toPlanetId: '2',
        orderedPlanetIds: ids,
      }),
    ).toBe('right')
    expect(
      pageSlideDirection({
        fromName: 'planet-detail',
        toName: 'planet-detail',
        fromPlanetId: '3',
        toPlanetId: '1',
        orderedPlanetIds: ids,
      }),
    ).toBe('right')
    expect(
      pageSlideDirection({
        fromName: 'planet-detail',
        toName: 'planet-detail',
        fromPlanetId: '2',
        toPlanetId: '1',
        orderedPlanetIds: ids,
      }),
    ).toBe('left')
    expect(
      pageSlideDirection({
        fromName: 'planet-detail',
        toName: 'planet-detail',
        fromPlanetId: '1',
        toPlanetId: '3',
        orderedPlanetIds: ids,
      }),
    ).toBe('left')
  })
})

describe('setPageSlide', () => {
  it('returns the click direction once, then clears it', () => {
    setPageSlide('left')
    expect(consumePageSlideFromClick()).toBe('left')
    expect(consumePageSlideFromClick()).toBeNull()
  })
})
