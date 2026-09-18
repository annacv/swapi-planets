<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import { planetIdFromUrl } from '@/api/swapi'
import LikeButton from '@/components/LikeButton.vue'
import { usePlanetsStore } from '@/stores/planets'
import { browsePlanetId } from '@/utils/browsePlanet'
import { setPageSlide } from '@/utils/pageSlide'
import { planetSurfaceStyle } from '@/utils/planetSurface'

const route = useRoute()
const store = usePlanetsStore()
const { planetsById, detailLoading, detailError, filteredPlanets, allPlanets } = storeToRefs(store)
const { loadPlanet, loadCatalogue, filmTitlesFor, residentNamesFor } = store

const planetId = computed(() => String(route.params.id))
const planet = computed(() => planetsById.value[planetId.value])
const filteredPlanetIds = computed(() =>
  filteredPlanets.value.map((item) => planetIdFromUrl(item.url)),
)
const nextPlanetId = computed(() => browsePlanetId(filteredPlanetIds.value, planetId.value, 'next'))
const previousPlanetId = computed(() =>
  browsePlanetId(filteredPlanetIds.value, planetId.value, 'previous'),
)

const filmLine = computed(() => {
  if (!planet.value) return ''
  const titles = filmTitlesFor(planet.value)
  return titles.length ? titles.join(', ') : 'No films listed'
})

const residentLine = computed(() => {
  if (!planet.value) return ''
  const names = residentNamesFor(planet.value)
  return names.length ? names.join(', ') : 'No known residents'
})

const stats = computed(() => {
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
    void loadPlanet(id).then((loaded) => {
      // Catalogue powers previous/next planet; load after the detail paints so it
      // stays off the LCP critical path on cold detail visits.
      if (loaded && allPlanets.value.length === 0) {
        void loadCatalogue()
      }
    })
  },
  { immediate: true },
)
</script>

<template>
  <main class="flex min-h-screen flex-col px-8 pb-10 pt-10 md:px-16 lg:pt-24 xl:px-32">
    <nav class="my-6 lg:hidden" aria-label="Back to planets">
      <RouterLink
        :to="{ name: 'planets' }"
        class="text-sm font-semibold text-ember hover:underline"
        @click="setPageSlide('left')"
      >
        ← Back to planets
      </RouterLink>
    </nav>

    <p v-if="detailLoading" class="mt-10 text-muted">Loading planet…</p>

    <div
      v-else-if="detailError"
      class="mt-10 max-w-lg rounded-md border border-red-900 bg-red-950/40 p-4"
    >
      <p class="text-red-200">{{ detailError }}</p>
      <button
        type="button"
        class="mt-3 rounded-full bg-red-900 px-3 py-1.5 text-sm text-red-50 hover:bg-red-800"
        @click="loadPlanet(planetId, { force: true })"
      >
        Retry
      </button>
    </div>

    <template v-else-if="planet">
      <article class="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16 xl:gap-24">
        <div
          class="mt-4 size-[min(38vw,78px)] shrink-0 rounded-full lg:size-[min(38vw,17.5rem)]"
          :style="planetSurfaceStyle(planet.terrain, planet.surface_water)"
          :aria-hidden="true"
        />

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-10 sm:gap-16">
            <h1 class="text-3xl font-normal tracking-tight md:text-4xl">{{ planet.name }}</h1>
            <LikeButton :planet-id="planetId" :planet-name="planet.name" :size="32" />
          </div>

          <section class="mt-8" aria-labelledby="films-heading">
            <h2
              id="films-heading"
              class="border-b border-star pb-2 text-sm font-normal uppercase tracking-wide text-star"
            >
              Films
            </h2>
            <p
              class="mt-4 text-xl font-light leading-snug text-star md:text-2xl"
              :class="{ italic: !planet.films.length }"
            >
              {{ filmLine }}
            </p>
          </section>

          <section class="mt-8" aria-labelledby="residents-heading">
            <h2
              id="residents-heading"
              class="border-b border-star pb-2 text-sm font-normal uppercase tracking-wide text-star"
            >
              Residents
            </h2>
            <p
              class="mt-4 text-xl font-light leading-snug text-star md:text-2xl"
              :class="{ italic: !planet.residents.length }"
            >
              {{ residentLine }}
            </p>
          </section>

          <dl class="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-10 lg:grid-cols-3">
            <div v-for="[label, value] in stats" :key="label">
              <dt
                class="border-b border-star pb-2 text-sm font-normal uppercase tracking-wide text-star"
              >
                {{ label }}
              </dt>
              <dd
                class="mt-4 text-xl font-light text-star md:text-2xl"
                :class="{ italic: value === 'unknown' }"
              >
                {{ value }}
              </dd>
            </div>
          </dl>
        </div>
      </article>

      <nav
        class="flex flex-wrap items-center justify-between gap-4 py-8"
        aria-label="Planet navigation"
      >
        <RouterLink
          :to="{ name: 'planets' }"
          class="hidden text-sm font-semibold text-ember hover:underline lg:inline"
          @click="setPageSlide('left')"
        >
          ← Back to planets
        </RouterLink>
        <div class="flex w-full items-center justify-between gap-6 lg:w-auto">
          <RouterLink
            v-if="previousPlanetId"
            :to="{ name: 'planet-detail', params: { id: previousPlanetId } }"
            class="text-sm font-semibold text-ember hover:underline"
            @click="setPageSlide('left')"
          >
            ← Previous planet
          </RouterLink>
          <RouterLink
            v-if="nextPlanetId"
            :to="{ name: 'planet-detail', params: { id: nextPlanetId } }"
            class="text-sm font-semibold text-ember hover:underline"
            @click="setPageSlide('right')"
          >
            Next planet →
          </RouterLink>
        </div>
      </nav>
    </template>
  </main>
</template>
