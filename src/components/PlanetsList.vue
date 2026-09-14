<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { planetIdFromUrl } from '@/api/swapi'
import HeartIcon from '@/components/HeartIcon.vue'
import { PAGE_SIZE, usePlanetsStore } from '@/stores/planets'

const props = defineProps<{
  focusedPlanetId: string | null
}>()

const emit = defineEmits<{
  'pointer-planet': [id: string | null]
}>()

const planetsStore = usePlanetsStore()
const { listedPlanets } = storeToRefs(planetsStore)
const { filmTitlesFor, isFavourite, toggleFavourite } = planetsStore

const rows = computed(() =>
  listedPlanets.value.map((planet) => {
    const id = planetIdFromUrl(planet.url)
    return {
      planet,
      id,
      films: filmTitlesFor(planet),
      favourite: isFavourite(id),
    }
  }),
)

const listKey = computed(() => rows.value.map((row) => row.planet.url).join('|'))
</script>

<template>
  <div class="flex flex-1 flex-col">
    <Transition name="planet-list" mode="out-in">
      <ul
        :key="listKey"
        class="flex flex-1 flex-col gap-1.5"
        :style="{ minHeight: `calc(${PAGE_SIZE} * 2.25rem + ${PAGE_SIZE - 1} * 0.375rem)` }"
      >
        <li
          v-for="row in rows"
          :key="row.planet.url"
          class="flex items-center gap-6"
          @mouseenter="emit('pointer-planet', row.id)"
          @mouseleave="emit('pointer-planet', null)"
        >
          <RouterLink
            :to="{ name: 'planet-detail', params: { id: row.id } }"
            class="w-[11rem] font-stretch-ultra-condensed truncate text-right text-3xl text-star underline decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-500 motion-reduce:transition-none"
            :class="row.id === focusedPlanetId ? 'decoration-flame' : 'decoration-star'"
            :title="row.planet.name"
          >
            {{ row.planet.name }}
          </RouterLink>
          <p class="min-w-0 flex-1 text-xxs leading-[13px] text-star">
            <span v-if="row.films.length">{{ row.films.join(', ') }}</span>
            <span v-else class="italic">No films listed</span>
          </p>
          <button
            type="button"
            class="shrink-0"
            :aria-pressed="row.favourite"
            :aria-label="
              row.favourite
                ? `Remove ${row.planet.name} from favourites`
                : `Add ${row.planet.name} to favourites`
            "
            @click="toggleFavourite(row.id)"
          >
            <HeartIcon :active="row.favourite" />
          </button>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.planet-list-enter-active,
.planet-list-leave-active {
  transition: opacity 0.4s ease;
}

.planet-list-enter-from,
.planet-list-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .planet-list-enter-active,
  .planet-list-leave-active {
    transition: none;
  }
}
</style>
