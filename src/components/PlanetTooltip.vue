<script setup lang="ts">
import { computed } from 'vue'

import type { SwapiPlanet } from '@/api/types'
import { circleSizePx, parseDiameter } from '@/utils/planetDiameter'
import { goldenAnglePosition } from '@/utils/goldenAnglePosition'

const props = defineProps<{
  planet: SwapiPlanet | null
  index: number
  count: number
  maxDiameter: number
  maxCirclePx?: number
}>()

const placement = computed(() => {
  if (props.index < 0 || !props.planet) return 'top'
  return goldenAnglePosition(props.index, props.count).y < 0.28 ? 'bottom' : 'top'
})

const style = computed(() => {
  if (!props.planet || props.index < 0) return {}
  const size = circleSizePx(props.planet.diameter, props.maxDiameter, props.maxCirclePx)
  const { x, y } = goldenAnglePosition(props.index, props.count)
  return {
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    '--tooltip-clearance': `${size / 2 + 16}px`,
  }
})

const formattedDiameter = computed(() => {
  if (!props.planet) return null
  const diameter = parseDiameter(props.planet.diameter)
  if (diameter === null) return null
  return `${diameter.toLocaleString()} km`
})
</script>

<template>
  <Transition name="planet-tooltip">
    <div
      v-if="planet"
      :key="planet.url"
      class="planet-tooltip pointer-events-none absolute z-[110] text-center"
      :class="placement === 'bottom' ? 'planet-tooltip-below' : undefined"
      :style="style"
      aria-hidden="true"
    >
      <p class="text-xs font-bold leading-tight text-star">{{ planet.name }}</p>
      <p v-if="formattedDiameter" class="text-xxs leading-[13px] text-star/80">
        <span class="mr-0.5 font-normal">⌀</span>{{ formattedDiameter }}
      </p>
    </div>
  </Transition>
</template>

<style scoped>
.planet-tooltip {
  transform: translate(-50%, calc(-100% - var(--tooltip-clearance, 16px)));
}

.planet-tooltip-below {
  transform: translate(-50%, var(--tooltip-clearance, 16px));
}

.planet-tooltip-enter-active,
.planet-tooltip-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.planet-tooltip-enter-from,
.planet-tooltip-leave-to {
  opacity: 0;
}

.planet-tooltip-enter-from:not(.planet-tooltip-below),
.planet-tooltip-leave-to:not(.planet-tooltip-below) {
  transform: translate(-50%, calc(-100% - var(--tooltip-clearance, 16px) + 8px));
}

.planet-tooltip-below.planet-tooltip-enter-from,
.planet-tooltip-below.planet-tooltip-leave-to {
  transform: translate(-50%, calc(var(--tooltip-clearance, 16px) - 8px));
}

@media (prefers-reduced-motion: reduce) {
  .planet-tooltip-enter-active,
  .planet-tooltip-leave-active {
    transition: none;
  }
}
</style>
