<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

import { planetIdFromUrl } from '@/api/swapi'
import type { SwapiPlanet } from '@/api/types'
import PlanetTooltip from '@/components/PlanetTooltip.vue'
import {
  circleSizePx,
  MAX_CIRCLE_MOBILE_PX,
  MAX_CIRCLE_PX,
  maxKnownDiameter,
} from '@/utils/planetDiameter'
import { goldenAnglePosition } from '@/utils/goldenAnglePosition'
import { planetSurfaceStyle } from '@/utils/planetSurface'

const props = defineProps<{
  planets: SwapiPlanet[]
  catalogue: SwapiPlanet[]
  pointerPlanetId?: string | null
}>()

const emit = defineEmits<{
  'focus-planet': [id: string | null]
}>()

const FOCUS_MS = 3000
const LG_QUERY = '(min-width: 1024px)'

const isLg = ref(typeof window !== 'undefined' ? window.matchMedia(LG_QUERY).matches : true)
const maxCirclePx = computed(() => (isLg.value ? MAX_CIRCLE_PX : MAX_CIRCLE_MOBILE_PX))
const maxDiameter = computed(() => maxKnownDiameter(props.catalogue))
const pageKey = computed(() => props.planets.map((planet) => planetIdFromUrl(planet.url)).join('|'))
const pointerIndex = ref<number | null>(null)
const currentIndex = ref(0)

function indexFromPointerId(id: string | null | undefined) {
  if (!id) return null
  const index = props.planets.findIndex((planet) => planetIdFromUrl(planet.url) === id)
  return index === -1 ? null : index
}

const focusedIndex = computed(() => pointerIndex.value ?? currentIndex.value)

watch(
  [focusedIndex, () => props.planets],
  () => {
    const planet = props.planets[focusedIndex.value]
    emit('focus-planet', planet ? planetIdFromUrl(planet.url) : null)
  },
  { immediate: true },
)

watch(
  () => props.pointerPlanetId,
  (id) => {
    pointerIndex.value = indexFromPointerId(id)
  },
)

function circleStyle(planet: SwapiPlanet, index: number) {
  const size = circleSizePx(planet.diameter, maxDiameter.value, maxCirclePx.value)
  const { x, y } = goldenAnglePosition(index, props.planets.length)

  return {
    '--planet-target': `${size}px`,
    '--planet-delay': `${index * 90}ms`,
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    zIndex: String(index === focusedIndex.value ? maxCirclePx.value + 1 : maxCirclePx.value - size),
    ...planetSurfaceStyle(planet.terrain, planet.surface_water),
  }
}

let focusTimer = 0
let lgMedia: MediaQueryList | null = null

function onLgChange(event: MediaQueryListEvent) {
  isLg.value = event.matches
}

function stopFocusCycle() {
  window.clearInterval(focusTimer)
  focusTimer = 0
}

function startFocusCycle() {
  stopFocusCycle()
  pointerIndex.value = indexFromPointerId(props.pointerPlanetId)
  currentIndex.value = 0

  if (props.planets.length === 0) return

  focusTimer = window.setInterval(() => {
    if (pointerIndex.value !== null) return
    currentIndex.value = (currentIndex.value + 1) % props.planets.length
  }, FOCUS_MS)
}

watch(pageKey, () => stopFocusCycle())

onMounted(() => {
  lgMedia = window.matchMedia(LG_QUERY)
  isLg.value = lgMedia.matches
  lgMedia.addEventListener('change', onLgChange)
})

onUnmounted(() => {
  stopFocusCycle()
  lgMedia?.removeEventListener('change', onLgChange)
})
</script>

<template>
  <div class="absolute inset-0 overflow-visible">
    <Transition name="planet-page" mode="out-in" appear @after-enter="startFocusCycle">
      <div :key="pageKey" class="absolute inset-0">
        <RouterLink
          v-for="(planet, index) in planets"
          :key="planet.url"
          :to="{ name: 'planet-detail', params: { id: planetIdFromUrl(planet.url) } }"
          class="planet-dot absolute rounded-full"
          :class="index === focusedIndex ? 'planet-dot-active' : undefined"
          :style="circleStyle(planet, index)"
          :aria-label="planet.name"
          @mouseenter="pointerIndex = index"
          @mouseleave="pointerIndex = null"
          @focus="pointerIndex = index"
          @blur="pointerIndex = null"
        />

        <PlanetTooltip
          :planet="planets[focusedIndex] ?? null"
          :index="focusedIndex"
          :count="planets.length"
          :max-diameter="maxDiameter"
          :max-circle-px="maxCirclePx"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.planet-dot {
  width: var(--planet-target);
  height: var(--planet-target);
  transform: translate(-50%, -50%) scale(1);
  box-shadow: 0 0 0 0 transparent;
  transition:
    transform 1.4s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.35s ease;
}

.planet-dot-active {
  box-shadow: 0 0 0 2px var(--color-flame);
}

.planet-page-leave-active {
  transition: opacity 0.4s ease;
}

.planet-page-leave-to {
  opacity: 0;
}

.planet-page-enter-from .planet-dot {
  transform: translate(-50%, -50%) scale(0);
}

.planet-page-enter-active .planet-dot {
  transition-delay: var(--planet-delay, 0ms);
}

@media (prefers-reduced-motion: reduce) {
  .planet-dot,
  .planet-page-leave-active,
  .planet-page-enter-active .planet-dot {
    transition: none;
    transition-delay: 0ms;
  }

  .planet-page-enter-from .planet-dot {
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
