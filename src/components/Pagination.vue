<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { usePlanetsStore } from '@/stores/planets'

const planetsStore = usePlanetsStore()
const { currentPage, pageCount, hasPrevious, hasNext, listLoading, listError, isSearching, filteredPlanets } =
  storeToRefs(planetsStore)
const { setPage } = planetsStore

const visible = computed(
  () => !listLoading.value && !listError.value && !isSearching.value && filteredPlanets.value.length > 0,
)
</script>

<template>
  <div
    v-if="visible"
    class="mt-auto flex items-center justify-between gap-4 border-t border-star/50 pt-4"
  >
    <p class="shrink-0 text-sm text-star">Page {{ currentPage }} of {{ pageCount }}</p>
    <nav class="flex flex-wrap items-center justify-end gap-1.5" aria-label="Pagination">
      <button
        type="button"
        class="rounded-full bg-star px-2.5 py-[5.5px] text-[13px] font-black leading-none text-galaxy enabled:hover:animate-blink disabled:opacity-40 motion-reduce:enabled:hover:animate-none"
        :disabled="!hasPrevious"
        @click="setPage(currentPage - 1)"
      >
        Prev
      </button>
      <button
        v-for="page in pageCount"
        :key="page"
        type="button"
        class="rounded px-2 py-1 text-[13px] font-black text-star hover:opacity-100"
        :class="page === currentPage ? 'opacity-100' : 'opacity-50'"
        :aria-current="page === currentPage ? 'page' : undefined"
        :aria-label="`Page ${page}`"
        @click="setPage(page)"
      >
        {{ page }}
      </button>
      <button
        type="button"
        class="rounded-full bg-star px-2.5 py-[5.5px] text-[13px] font-black leading-none text-galaxy enabled:hover:animate-blink disabled:opacity-40 motion-reduce:enabled:hover:animate-none"
        :disabled="!hasNext"
        @click="setPage(currentPage + 1)"
      >
        Next
      </button>
    </nav>
  </div>
</template>
