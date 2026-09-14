import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { getAllPlanets, getFilms, getPlanet, planetIdFromUrl } from '@/api/swapi'
import type { SwapiPlanet } from '@/api/types'
import { pageCountFor, pageSlice } from '@/utils/pagination'
import { readStringList, writeStringList } from '@/utils/storage'

const FAVOURITES_KEY = 'swapi-planets:favourites'
const PAGE_SIZE = 10

export const usePlanetsStore = defineStore('planets', () => {
  const filmTitlesByUrl = ref<Record<string, string>>({})
  const allPlanets = ref<SwapiPlanet[]>([])
  const planetsById = ref<Record<string, SwapiPlanet>>({})
  const currentPage = ref(1)
  const searchQuery = ref('')
  const showFavouritesOnly = ref(false)
  const favouriteIds = ref<string[]>(readStringList(FAVOURITES_KEY))

  const listLoading = ref(false)
  const listError = ref<string | null>(null)
  const detailLoading = ref(false)
  const detailError = ref<string | null>(null)

  function isFavourite(id: string): boolean {
    return favouriteIds.value.includes(id)
  }

  const filteredPlanets = computed(() => {
    const planets = showFavouritesOnly.value
      ? allPlanets.value.filter((planet) => isFavourite(planetIdFromUrl(planet.url)))
      : allPlanets.value

    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return planets
    return planets.filter((planet) => planet.name.toLowerCase().startsWith(query))
  })

  const pageCount = computed(() => pageCountFor(filteredPlanets.value.length, PAGE_SIZE))

  const pagedPlanets = computed(() => pageSlice(filteredPlanets.value, currentPage.value, PAGE_SIZE))

  const listedPlanets = computed(() => {
    if (searchQuery.value.trim()) return filteredPlanets.value
    return pagedPlanets.value
  })

  const isSearching = computed(() => searchQuery.value.trim().length > 0)

  const hasNext = computed(() => currentPage.value < pageCount.value)
  const hasPrevious = computed(() => currentPage.value > 1)
  const totalCount = computed(() => filteredPlanets.value.length)

  const favouritePlanets = computed(() =>
    favouriteIds.value.map((id) => ({
      id,
      name: planetsById.value[id]?.name ?? `Planet ${id}`,
    })),
  )

  watch([searchQuery, showFavouritesOnly], () => {
    currentPage.value = 1
  })

  watch(pageCount, (count) => {
    if (currentPage.value > count) {
      currentPage.value = count
    }
  })

  function cachePlanet(planet: SwapiPlanet) {
    planetsById.value[planetIdFromUrl(planet.url)] = planet
  }

  function filmTitlesFor(planet: SwapiPlanet): string[] {
    return planet.films.map((url) => filmTitlesByUrl.value[url]).filter((title): title is string => Boolean(title))
  }

  function toggleFavourite(id: string) {
    const next = isFavourite(id)
      ? favouriteIds.value.filter((favouriteId) => favouriteId !== id)
      : [...favouriteIds.value, id]
    favouriteIds.value = next
    writeStringList(FAVOURITES_KEY, next)
  }

  function setPage(page: number) {
    if (page < 1 || page > pageCount.value) return
    currentPage.value = page
  }

  function setSearchQuery(value: string) {
    searchQuery.value = value
    currentPage.value = 1
  }

  function toggleFavouritesFilter() {
    showFavouritesOnly.value = !showFavouritesOnly.value
    currentPage.value = 1
  }

  async function ensureFilms() {
    if (Object.keys(filmTitlesByUrl.value).length > 0) return

    const films = await getFilms()
    filmTitlesByUrl.value = Object.fromEntries(films.map((film) => [film.url, film.title]))
  }

  async function loadCatalogue({ force = false } = {}) {
    listError.value = null

    if (!force && allPlanets.value.length > 0) {
      return
    }

    listLoading.value = true
    try {
      await ensureFilms()
      const planets = await getAllPlanets()
      allPlanets.value = planets
      planets.forEach(cachePlanet)
    } catch (error) {
      listError.value = error instanceof Error ? error.message : 'Failed to load planets'
    } finally {
      listLoading.value = false
    }
  }

  async function loadPlanet(id: string, { force = false } = {}) {
    detailError.value = null

    if (!force && planetsById.value[id]) {
      return planetsById.value[id]
    }

    detailLoading.value = true
    try {
      await ensureFilms()
      const planet = await getPlanet(id)
      cachePlanet(planet)
      return planet
    } catch (error) {
      detailError.value = error instanceof Error ? error.message : 'Failed to load planet'
      return null
    } finally {
      detailLoading.value = false
    }
  }

  return {
    filmTitlesByUrl,
    allPlanets,
    currentPage,
    pageCount,
    hasNext,
    hasPrevious,
    totalCount,
    searchQuery,
    showFavouritesOnly,
    favouriteIds,
    listLoading,
    listError,
    detailLoading,
    detailError,
    filteredPlanets,
    pagedPlanets,
    listedPlanets,
    isSearching,
    favouritePlanets,
    planetsById,
    filmTitlesFor,
    isFavourite,
    toggleFavourite,
    setPage,
    setSearchQuery,
    toggleFavouritesFilter,
    ensureFilms,
    loadCatalogue,
    loadPlanet,
  }
})
