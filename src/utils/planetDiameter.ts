import type { SwapiPlanet } from '@/api/types'

export const MAX_CIRCLE_PX = 120
export const MAX_CIRCLE_MOBILE_PX = 78
export const MIN_CIRCLE_PX = 16

export function parseDiameter(value: string): number | null {
  const diameter = Number(value)
  if (!Number.isFinite(diameter) || diameter <= 0) return null
  return diameter
}

export function maxKnownDiameter(planets: SwapiPlanet[]): number {
  let max = 0
  for (const planet of planets) {
    const diameter = parseDiameter(planet.diameter)
    if (diameter !== null && diameter > max) max = diameter
  }
  return max
}

export function circleSizePx(diameter: string, maxDiameter: number, maxCirclePx = MAX_CIRCLE_PX): number {
  const parsed = parseDiameter(diameter)
  if (parsed === null || maxDiameter <= 0) return MIN_CIRCLE_PX
  const ratio = Math.sqrt(parsed / maxDiameter)
  return Math.max(MIN_CIRCLE_PX, Math.round(ratio * maxCirclePx))
}
