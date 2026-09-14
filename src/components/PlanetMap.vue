<script setup lang="ts">
import { computed } from 'vue'

import { planetIdFromUrl } from '@/api/swapi'
import type { SwapiPlanet } from '@/api/types'
import { circleSizePx, MAX_CIRCLE_PX, maxKnownDiameter } from '@/utils/planetDiameter'

const props = defineProps<{
  planets: SwapiPlanet[]
  catalogue: SwapiPlanet[]
}>()

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

const maxDiameter = computed(() => maxKnownDiameter(props.catalogue))

function circleStyle(planet: SwapiPlanet, index: number) {
  const size = circleSizePx(planet.diameter, maxDiameter.value)
  const count = Math.max(props.planets.length, 1)
  const radius = Math.sqrt((index + 0.5) / count) * 0.4
  const angle = index * GOLDEN_ANGLE
  const cx = 0.48 + Math.cos(angle) * radius
  const cy = 0.52 + Math.sin(angle) * radius

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `calc(${cx * 100}% - ${size / 2}px)`,
    top: `calc(${cy * 100}% - ${size / 2}px)`,
    zIndex: String(MAX_CIRCLE_PX - size),
  }
}
</script>

<template>
  <div class="absolute inset-0 overflow-hidden">
    <RouterLink
      v-for="(planet, index) in planets"
      :key="planet.url"
      :to="{ name: 'planet-detail', params: { id: planetIdFromUrl(planet.url) } }"
      class="absolute rounded-full bg-star hover:opacity-90"
      :style="circleStyle(planet, index)"
      :aria-label="planet.name"
    />
  </div>
</template>
