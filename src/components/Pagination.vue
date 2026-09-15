<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { usePlanetsStore } from '@/stores/planets'

const planetsStore = usePlanetsStore()
const { currentPage, pageCount, listLoading, listError, isSearching, filteredPlanets } =
  storeToRefs(planetsStore)
const { setPage } = planetsStore

const hasPrevious = computed(() => currentPage.value > 1)
const hasNext = computed(() => currentPage.value < pageCount.value)

const visible = computed(
  () => !listLoading.value && !listError.value && !isSearching.value && filteredPlanets.value.length > 0,
)
</script>

<template>
  <div
    v-if="visible"
    class="mt-auto flex items-center justify-between gap-4 border-t border-star/50 pt-4 pb-10 lg:pb-0"
  >
    <p class="shrink-0 text-sm text-star">Page {{ currentPage }} of {{ pageCount }}</p>
    <nav class="flex items-center justify-end" aria-label="Pagination">
      <div
        class="hidden overflow-hidden transition-[max-width,margin,opacity] duration-300 ease-out motion-reduce:transition-none sm:block"
        :class="hasPrevious ? 'mr-1.5 max-w-10 opacity-100' : 'pointer-events-none mr-0 max-w-0 opacity-0'"
        :aria-hidden="!hasPrevious"
      >
        <button
          type="button"
          class="cursor-pointer whitespace-nowrap rounded-full bg-star px-2.5 py-[5.5px] text-sm font-black leading-none text-galaxy"
          aria-label="Previous page"
          :tabindex="hasPrevious ? undefined : -1"
          @click="setPage(currentPage - 1)"
        >
          ←
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-3 md:gap-1.5">
        <button
          v-for="page in pageCount"
          :key="page"
          type="button"
          class="cursor-pointer rounded px-2 py-1 text-sm font-black text-star hover:opacity-100"
          :class="page === currentPage ? 'opacity-100' : 'opacity-50'"
          :aria-current="page === currentPage ? 'page' : undefined"
          :aria-label="`Page ${page}`"
          @click="setPage(page)"
        >
          {{ page }}
        </button>
      </div>

      <div
        class="hidden overflow-hidden transition-[max-width,margin,opacity] duration-300 ease-out motion-reduce:transition-none sm:block"
        :class="hasNext ? 'ml-1.5 max-w-10 opacity-100' : 'pointer-events-none ml-0 max-w-0 opacity-0'"
        :aria-hidden="!hasNext"
      >
        <button
          type="button"
          class="cursor-pointer whitespace-nowrap rounded-full bg-star px-2.5 py-[5.5px] text-sm font-black leading-none text-galaxy"
          aria-label="Next page"
          :tabindex="hasNext ? undefined : -1"
          @click="setPage(currentPage + 1)"
        >
          →
        </button>
      </div>
    </nav>
  </div>
</template>
