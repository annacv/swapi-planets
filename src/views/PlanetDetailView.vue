<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'

import HeartIcon from '@/components/HeartIcon.vue'
import { usePlanetsStore } from '@/stores/planets'

const route = useRoute()
const store = usePlanetsStore()

const planetId = computed(() => String(route.params.id))
const planet = computed(() => store.planetsById[planetId.value])

const fields = computed(() => {
  if (!planet.value) return []
  return [
    ['Climate', planet.value.climate],
    ['Terrain', planet.value.terrain],
    ['Population', planet.value.population],
    ['Diameter', planet.value.diameter],
    ['Gravity', planet.value.gravity],
    ['Surface water', planet.value.surface_water],
    ['Rotation period', planet.value.rotation_period],
    ['Orbital period', planet.value.orbital_period],
  ] as const
})

watch(
  planetId,
  (id) => {
    void store.loadPlanet(id)
  },
  { immediate: true },
)
</script>

<template>
  <main class="mx-auto max-w-3xl px-4 pb-8 pt-20">
    <p>
      <RouterLink to="/planets" class="text-sm text-flame hover:underline">← Back to planets</RouterLink>
    </p>

    <p v-if="store.detailLoading" class="mt-6 text-stone-400">Loading planet…</p>

    <div v-else-if="store.detailError" class="mt-6 rounded-md border border-red-900 bg-red-950/40 p-4">
      <p class="text-red-200">{{ store.detailError }}</p>
      <button
        type="button"
        class="mt-3 rounded-md bg-red-900 px-3 py-1.5 text-sm text-red-50 hover:bg-red-800"
        @click="store.loadPlanet(planetId, { force: true })"
      >
        Retry
      </button>
    </div>

    <article v-else-if="planet" class="mt-6">
      <div class="flex items-start justify-between gap-4">
        <h1 class="text-3xl font-semibold tracking-tight">{{ planet.name }}</h1>
        <button
          type="button"
          class="shrink-0"
          :aria-pressed="store.isFavourite(planetId)"
          :aria-label="
            store.isFavourite(planetId) ? `Remove ${planet.name} from favourites` : `Add ${planet.name} to favourites`
          "
          @click="store.toggleFavourite(planetId)"
        >
          <HeartIcon :active="store.isFavourite(planetId)" />
        </button>
      </div>

      <dl class="mt-6 grid gap-4 sm:grid-cols-2">
        <div v-for="[label, value] in fields" :key="label" class="rounded-md border border-stone-800 bg-stone-900/50 p-3">
          <dt class="text-xs uppercase tracking-wide text-stone-500">{{ label }}</dt>
          <dd class="mt-1 text-stone-100">{{ value }}</dd>
        </div>
      </dl>

      <section class="mt-8" aria-labelledby="films-heading">
        <h2 id="films-heading" class="text-sm font-medium uppercase tracking-wide text-stone-500">Films</h2>
        <ul v-if="store.filmTitlesFor(planet).length" class="mt-2 list-disc pl-5 text-stone-200">
          <li v-for="title in store.filmTitlesFor(planet)" :key="title">{{ title }}</li>
        </ul>
        <p v-else class="mt-2 text-stone-400">No films listed</p>
      </section>
    </article>
  </main>
</template>
