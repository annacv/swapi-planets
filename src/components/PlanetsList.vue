<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { planetIdFromUrl } from '@/api/swapi'
import HeartIcon from '@/components/HeartIcon.vue'
import { usePlanetsStore } from '@/stores/planets'

const planetsStore = usePlanetsStore()
const { listedPlanets } = storeToRefs(planetsStore)
const { filmTitlesFor, isFavourite, toggleFavourite } = planetsStore
</script>

<template>
  <div class="flex flex-1 flex-col">
    <ul class="flex h-full flex-col gap-1.5 flex-1">
      <li
        v-for="planet in listedPlanets"
        :key="planet.url"
        class="flex items-center gap-6"
      >
        <RouterLink
          :to="{ name: 'planet-detail', params: { id: planetIdFromUrl(planet.url) } }"
          class="w-[11rem] font-stretch-ultra-condensed truncate text-right text-3xl text-star underline decoration-star decoration-1 underline-offset-[6px]"
          :title="planet.name"
        >
          {{ planet.name }}
        </RouterLink>
        <p class="min-w-0 flex-1 text-xxs leading-[13px] text-star">
          <span v-if="filmTitlesFor(planet).length">
            {{ filmTitlesFor(planet).join(', ') }}
          </span>
          <span v-else>No films listed</span>
        </p>
        <button
          type="button"
          class="shrink-0"
          :aria-pressed="isFavourite(planetIdFromUrl(planet.url))"
          :aria-label="
            isFavourite(planetIdFromUrl(planet.url))
              ? `Remove ${planet.name} from favourites`
              : `Add ${planet.name} to favourites`
          "
          @click="toggleFavourite(planetIdFromUrl(planet.url))"
        >
          <HeartIcon :active="isFavourite(planetIdFromUrl(planet.url))" />
        </button>
      </li>
    </ul>
  </div>
</template>
