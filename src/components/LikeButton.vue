<script setup lang="ts">
import { usePlanetsStore } from '@/stores/planets'

const props = withDefaults(
  defineProps<{
    planetId: string
    planetName: string
    size?: number
  }>(),
  {
    size: 20,
  },
)

const { isFavourite, toggleFavourite } = usePlanetsStore()
</script>

<template>
  <button
    type="button"
    class="inline-flex shrink-0 appearance-none items-center justify-center overflow-hidden p-0"
    :class="isFavourite(planetId) ? 'text-star' : 'text-heart'"
    :style="{ width: `${props.size}px`, height: `${props.size}px`, lineHeight: 0, fontSize: 0 }"
    :aria-pressed="isFavourite(planetId)"
    :aria-label="
      isFavourite(planetId)
        ? `Remove ${planetName} from favourites`
        : `Add ${planetName} to favourites`
    "
    @click="toggleFavourite(planetId)"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 15 15"
      fill="currentColor"
      class="block size-full cursor-pointer"
      aria-hidden="true"
    >
      <path
        d="M13.91,6.75c-1.17,2.25-4.3,5.31-6.07,6.94c-0.1903,0.1718-0.4797,0.1718-0.67,0C5.39,12.06,2.26,9,1.09,6.75
	C-1.48,1.8,5-1.5,7.5,3.45C10-1.5,16.48,1.8,13.91,6.75z"
      />
    </svg>
  </button>
</template>
