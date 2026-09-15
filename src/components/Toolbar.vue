<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { usePlanetsStore } from '@/stores/planets'

const planetsStore = usePlanetsStore()
const { searchQuery, showFavouritesOnly } = storeToRefs(planetsStore)
const { setSearchQuery, toggleFavouritesFilter } = planetsStore

function onSearchInput(event: Event) {
  setSearchQuery((event.target as HTMLInputElement).value)
}

function clearSearch() {
  setSearchQuery('')
}
</script>

<template>
  <div class="flex items-center justify-between gap-8">
    <label for="planet-search" class="sr-only">Search planets by name</label>
    <div class="relative min-w-0 max-w-[320px] flex-1">
      <input
        id="planet-search"
        :value="searchQuery"
        type="search"
        placeholder="Search planets by name"
        class="planet-search h-9 w-full rounded-full bg-field px-3 text-base text-galaxy placeholder:text-heart lg:text-xs"
        :class="searchQuery ? 'pr-9' : undefined"
        @input="onSearchInput"
      />
      <button
        v-if="searchQuery"
        type="button"
        class="absolute cursor-pointer top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center text-heart"
        aria-label="Clear search"
        @click="clearSearch"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" class="size-3.5" aria-hidden="true">
          <path
            d="M3 3l10 10M13 3L3 13"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
    <div class="flex shrink-0 items-center gap-2.5">
      <span id="favourites-filter-label" class="text-xs font-bold tracking-[0.12em] text-star">
        LIKED
      </span>
      <button
        type="button"
        role="switch"
        class="relative h-[18px] w-[32px] cursor-pointer rounded-full"
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
