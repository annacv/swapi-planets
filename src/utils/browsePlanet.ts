export type BrowsePlanetDirection = 'next' | 'previous'

/** Id of the adjacent planet in `ids`, wrapping at the ends. Null if there is no distinct neighbour. */
export function browsePlanetId(
  ids: string[],
  currentId: string,
  direction: BrowsePlanetDirection,
): string | null {
  if (ids.length < 2) return null
  const currentIndex = ids.indexOf(currentId)
  if (currentIndex === -1) return null
  const offset = direction === 'next' ? 1 : -1
  return ids[(currentIndex + offset + ids.length) % ids.length] ?? null
}
