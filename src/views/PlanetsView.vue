<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'

import Pagination from '@/components/Pagination.vue'
import PlanetMap from '@/components/PlanetMap.vue'
import PlanetsList from '@/components/PlanetsList.vue'
import StatusMessage from '@/components/StatusMessage.vue'
import Toolbar from '@/components/Toolbar.vue'
import { usePlanetsStore } from '@/stores/planets'
import { getListStatusMessage } from '@/utils/listStatusMessage'

const planetsStore = usePlanetsStore()
const {
  listLoading,
  listError,
  listedPlanets,
  allPlanets,
  filteredPlanets,
  showFavouritesOnly,
  favouriteIds,
} = storeToRefs(planetsStore)
const { loadCatalogue, setSearchQuery, toggleFavouritesFilter } = planetsStore

const focusedPlanetId = ref<string | null>(null)
const listPointerPlanetId = ref<string | null>(null)

const statusMessage = computed(() =>
  getListStatusMessage({
    listError: listError.value,
    filteredCount: filteredPlanets.value.length,
    showFavouritesOnly: showFavouritesOnly.value,
    favouriteCount: favouriteIds.value.length,
  }),
)

function onStatusAction() {
  if (statusMessage.value?.action === 'show-all') {
    if (showFavouritesOnly.value) toggleFavouritesFilter()
    setSearchQuery('')
    return
  }
  setSearchQuery('')
  void loadCatalogue({ force: true })
}

onMounted(() => {
  void loadCatalogue()
})
</script>

<template>
  <main
    class="grid min-h-screen grid-cols-1 items-start gap-y-0 md:gap-y-6 lg:grid-cols-[minmax(0,1fr)_42rem] lg:grid-rows-[auto_minmax(0,1fr)]"
  >
    <div
      class="px-6 pt-16 md:pt-10 lg:col-start-2 lg:row-start-1 lg:px-10 lg:pr-16 lg:pt-24 xl:pr-32"
    >
      <Toolbar />
    </div>

    <section
      class="relative h-[42vh] min-h-[16rem] self-stretch lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:h-auto lg:min-h-screen"
      aria-label="Planet map"
    >
      <PlanetMap
        v-if="!listLoading && !statusMessage"
        :planets="listedPlanets"
        :catalogue="allPlanets"
        :pointer-planet-id="listPointerPlanetId"
        @focus-planet="focusedPlanetId = $event"
      />
    </section>

    <section
      class="flex flex-1 flex-col gap-6 px-6 pb-6 lg:col-start-2 lg:row-start-2 lg:px-10 lg:pr-16 xl:pr-32"
    >
      <p v-if="listLoading" class="mt-10 text-sm text-muted">Loading planets…</p>

      <StatusMessage
        v-else-if="statusMessage"
        :message="statusMessage.message"
        :action-label="statusMessage.actionLabel"
        :tone="statusMessage.tone"
        @action="onStatusAction"
      />

      <template v-else>
        <PlanetsList
          :focused-planet-id="focusedPlanetId"
          @pointer-planet="listPointerPlanetId = $event"
        />
        <Pagination />
      </template>
    </section>
  </main>
</template>
