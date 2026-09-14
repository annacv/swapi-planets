<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { usePlanetsStore } from '@/stores/planets'

const planetsStore = usePlanetsStore()
const { searchQuery, showFavouritesOnly } = storeToRefs(planetsStore)
const { setSearchQuery, toggleFavouritesFilter } = planetsStore

function onSearchInput(event: Event) {
  setSearchQuery((event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="flex items-center justify-between gap-8">
    <label for="planet-search" class="sr-only">Search planets by name</label>
    <input
      id="planet-search"
      :value="searchQuery"
      type="search"
      placeholder="Search planets by name"
      class="planet-search h-9 min-w-0 max-w-[320px] flex-1 rounded-full bg-field px-3 text-[13px] text-galaxy placeholder:text-heart focus:outline-none"
      @input="onSearchInput"
    />
    <div class="flex shrink-0 items-center gap-2.5">
      <span id="favourites-filter-label" class="text-xs font-bold tracking-[0.12em] text-star">
        LIKED
      </span>
      <button
        type="button"
        role="switch"
        class="relative h-[18px] w-[32px] rounded-full"
        :class="showFavouritesOnly ? 'bg-star' : 'bg-star/25'"
        :aria-checked="showFavouritesOnly"
        aria-labelledby="favourites-filter-label"
        @click="toggleFavouritesFilter()"
      >
        <span
          class="absolute top-[2px] size-[14px] rounded-full transition-[left,background-color]"
          :class="showFavouritesOnly ? 'left-[16px] bg-galaxy' : 'left-[2px] bg-star'"
        />
      </button>
    </div>
  </div>
</template>
