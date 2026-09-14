const SEA_COLOR = '#1a6fb5'
const UNKNOWN_TERRAIN_COLOR = '#c8c8c8'

/** Exact SWAPI terrain tokens → land color. */
const TERRAIN_COLORS: Record<string, string> = {
  'acid pools': '#c6d64a',
  'airless asteroid': '#6a6560',
  ash: '#6b6560',
  barren: '#a89880',
  bogs: '#3f5a30',
  canyons: '#8a7b68',
  caves: '#5c5348',
  cities: '#9aa3b0',
  cityscape: '#9aa3b0',
  cliffs: '#7d766c',
  desert: '#e0b15a',
  deserts: '#e0b15a',
  fields: '#7dae45',
  forests: '#1e7a3a',
  'fungus forests': '#7a4a8a',
  'gas giant': '#e6c07a',
  glaciers: '#dceaf4',
  grass: '#6fa83d',
  grasslands: '#6fa83d',
  'grassy hills': '#6fa83d',
  hills: '#7a9a4e',
  'ice canyons': '#c5d8e8',
  'ice caves': '#c5d8e8',
  islands: '#3d8f6a',
  jungle: '#157a32',
  jungles: '#157a32',
  lakes: '#2a86c4',
  'lava rivers': '#ff6b2b',
  mesas: '#b08958',
  mountain: '#8b8378',
  'mountain ranges': '#8b8378',
  mountains: '#8b8378',
  ocean: '#1a6fb5',
  oceans: '#1a6fb5',
  plains: '#7dae45',
  plateaus: '#9a8b72',
  rainforests: '#0f5f28',
  reefs: '#1f8a9a',
  rivers: '#2a86c4',
  rock: '#9a8f7a',
  'rock arches': '#9a8f7a',
  rocky: '#9a8f7a',
  'rocky canyons': '#8a7b68',
  'rocky deserts': '#c49a4a',
  'rocky islands': '#6e8f7a',
  savanna: '#c4b04a',
  savannahs: '#c4b04a',
  savannas: '#c4b04a',
  scrublands: '#b39b5a',
  seas: '#1a6fb5',
  sinkholes: '#5a6b48',
  swamp: '#4a6b38',
  swamps: '#4a6b38',
  'toxic cloudsea': '#7a9a3a',
  tundra: '#d8e6f0',
  unknown: UNKNOWN_TERRAIN_COLOR,
  urban: '#9aa3b0',
  valleys: '#7d8b68',
  verdant: '#4f9a3a',
  vines: '#2d8a4e',
  volcanoes: '#d94a1f',
}

export function parseSurfaceWater(value: string): number | null {
  const water = Number(value)
  if (!Number.isFinite(water) || water < 0) return null
  return Math.min(water, 100)
}

export function terrainTokens(terrain: string): string[] {
  return terrain
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter((token) => token.length > 0)
}

export function colorForTerrain(token: string): string {
  return TERRAIN_COLORS[token] ?? UNKNOWN_TERRAIN_COLOR
}

export function planetSurfaceBackground(terrain: string, surfaceWater: string): string {
  const landColors = terrainTokens(terrain).map(colorForTerrain)
  const colors = landColors.length > 0 ? landColors : [UNKNOWN_TERRAIN_COLOR]
  const waterPct = parseSurfaceWater(surfaceWater) ?? 0
  const landSpan = Math.max(0, 100 - waterPct)

  const stops: string[] = []

  if (landSpan > 0) {
    if (colors.length === 1) {
      stops.push(`${colors[0]} 0%`)
      stops.push(`${colors[0]} ${landSpan}%`)
    } else {
      colors.forEach((color, index) => {
        const pos = (index / (colors.length - 1)) * landSpan
        stops.push(`${color} ${pos}%`)
      })
    }
  }

  if (waterPct > 0) {
    if (landSpan === 0) {
      stops.push(`${SEA_COLOR} 0%`, `${SEA_COLOR} 100%`)
    } else {
      stops.push(`${SEA_COLOR} 100%`)
    }
  }

  return `linear-gradient(155deg, ${stops.join(', ')})`
}

export function planetSurfaceStyle(terrain: string, surfaceWater: string): { backgroundImage: string } {
  return { backgroundImage: planetSurfaceBackground(terrain, surfaceWater) }
}
