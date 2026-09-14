<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import Pagination from '@/components/Pagination.vue'
import PlanetMap from '@/components/PlanetMap.vue'
import PlanetsList from '@/components/PlanetsList.vue'
import Toolbar from '@/components/Toolbar.vue'
import { usePlanetsStore } from '@/stores/planets'

const planetsStore = usePlanetsStore()
const { listLoading, listError, listedPlanets, allPlanets, filteredPlanets } = storeToRefs(planetsStore)
const { loadCatalogue } = planetsStore

const focusedPlanetId = ref<string | null>(null)
const listPointerPlanetId = ref<string | null>(null)

const listStatus = computed(() => {
  if (listLoading.value) return 'loading'
  if (listError.value) return 'error'
  if (filteredPlanets.value.length === 0) return 'empty'
  return 'ready'
})

onMounted(() => {
  void loadCatalogue()
})
</script>

<template>
  <main class="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_42rem] items-start">
    <section class="relative h-[42vh] min-h-[16rem] self-stretch lg:h-auto lg:min-h-screen" aria-label="Planet map">
      <PlanetMap
        v-if="listStatus === 'ready'"
        :planets="listedPlanets"
        :catalogue="allPlanets"
        :pointer-planet-id="listPointerPlanetId"
        @focus-planet="focusedPlanetId = $event"
      />
    </section>

    <section class="flex flex-col flex-1 gap-6 px-6 lg:px-10 lg:pr-16 xl:pr-32 pt-10 lg:pt-24">
      <Toolbar />

      <p v-if="listStatus === 'loading'" class="mt-10 text-sm text-muted">Loading planets…</p>

      <template v-else-if="listStatus === 'error' || listStatus === 'empty'">
        <div class="mt-10">
          <p :class="listStatus === 'error' ? 'text-ember' : 'text-sm text-muted'">
            {{ listStatus === 'error' ? listError : 'No planets found.' }}
          </p>
          <button
            type="button"
            class="mt-3 rounded bg-star px-3 py-1 text-sm text-galaxy"
            @click="loadCatalogue({ force: true })"
          >
            Retry
          </button>
        </div>
      </template>

      <template v-if="listStatus === 'ready'">
        <PlanetsList
          :focused-planet-id="focusedPlanetId"
          @pointer-planet="listPointerPlanetId = $event"
        />
        <Pagination />
      </template>
    </section>
  </main>
</template>
