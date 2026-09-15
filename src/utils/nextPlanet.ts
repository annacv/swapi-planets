/** Id of the next planet in `ids`, wrapping from last to first. Null if there is no distinct next. */
export function nextPlanetId(ids: string[], currentId: string): string | null {
  if (ids.length < 2) return null
  const currentIndex = ids.indexOf(currentId)
  if (currentIndex === -1) return null
  return ids[(currentIndex + 1) % ids.length] ?? null
}
