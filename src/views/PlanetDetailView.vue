<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

import LikeButton from '@/components/LikeButton.vue'
import { usePlanetsStore } from '@/stores/planets'

const route = useRoute()
const store = usePlanetsStore()
const { planetsById, detailLoading, detailError } = storeToRefs(store)
const { loadPlanet, filmTitlesFor } = store

const planetId = computed(() => String(route.params.id))
const planet = computed(() => planetsById.value[planetId.value])

const filmLine = computed(() => {
  if (!planet.value) return ''
  const titles = filmTitlesFor(planet.value)
  return titles.length ? titles.join(', ') : 'No films listed'
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
    void loadPlanet(id)
  },
  { immediate: true },
)
</script>

<template>
  <main class="flex min-h-screen flex-col px-16 pb-10 pt-10 lg:pt-24 xl:px-32">
    <p v-if="detailLoading" class="mt-10 text-muted">Loading planet…</p>

    <div v-else-if="detailError" class="mt-10 max-w-lg rounded-md border border-red-900 bg-red-950/40 p-4">
      <p class="text-red-200">{{ detailError }}</p>
      <button
        type="button"
        class="mt-3 rounded-full bg-red-900 px-3 py-1.5 text-sm text-red-50 hover:bg-red-800"
        @click="loadPlanet(planetId, { force: true })"
      >
        Retry
      </button>
    </div>

    <article v-else-if="planet" class="flex flex-1 flex-col gap-10 lg:flex-row lg:items-start lg:gap-16 xl:gap-24">
      <div
        class="mt-4 size-[min(38vw,17.5rem)] shrink-0 rounded-full bg-star"
        :aria-hidden="true"
      />

      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-10 sm:gap-16">
          <h1 class="text-4xl font-normal tracking-tight">{{ planet.name }}</h1>
          <LikeButton :planet-id="planetId" :planet-name="planet.name" :size="32" />
        </div>

        <section class="mt-8" aria-labelledby="films-heading">
          <h2
            id="films-heading"
            class="border-b border-star pb-2 text-sm font-normal uppercase tracking-wide text-star"
          >
            Films
          </h2>
          <p class="mt-4 text-2xl font-light leading-snug text-star">{{ filmLine }}</p>
        </section>

        <dl class="mt-10 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="[label, value] in stats" :key="label">
            <dt class="border-b border-star pb-2 text-sm font-normal uppercase tracking-wide text-star">
              {{ label }}
            </dt>
            <dd class="mt-4 text-2xl font-light text-star">{{ value }}</dd>
          </div>
        </dl>
      </div>
    </article>

    <p class="py-8">
      <RouterLink to="/planets" class="font-semibold text-ember hover:underline text-sm">
        ← Back to planets
      </RouterLink>
    </p>
  </main>
</template>
