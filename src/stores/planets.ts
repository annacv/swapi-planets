import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getAllPlanets, getFilms, getPeople, getPlanet, planetIdFromUrl } from '@/api/swapi'
import type { SwapiPlanet } from '@/api/types'
import { pageCountFor, pageSlice } from '@/utils/pagination'
import { readStringList, writeStringList } from '@/utils/storage'

const FAVOURITES_KEY = 'swapi-planets:favourites'
export const PAGE_SIZE = 10

export const usePlanetsStore = defineStore('planets', () => {
  const filmTitlesByUrl = ref<Record<string, string>>({})
  const residentNamesByUrl = ref<Record<string, string>>({})
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

    const listed = planets.filter((planet) => planet.name && planet.name !== 'unknown')
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) return listed
    return listed.filter((planet) => planet.name.toLowerCase().startsWith(query))
  })

  const pageCount = computed(() => pageCountFor(filteredPlanets.value.length, PAGE_SIZE))
  const isSearching = computed(() => searchQuery.value.trim().length > 0)
  const listedPlanets = computed(() => {
    if (isSearching.value) return filteredPlanets.value
    return pageSlice(filteredPlanets.value, currentPage.value, PAGE_SIZE)
  })

  function setPage(page: number) {
    currentPage.value = Math.min(Math.max(page, 1), pageCount.value)
  }

  function cachePlanet(planet: SwapiPlanet) {
    planetsById.value[planetIdFromUrl(planet.url)] = planet
  }

  function filmTitlesFor(planet: SwapiPlanet): string[] {
    return planet.films
      .map((url) => filmTitlesByUrl.value[url])
      .filter((title): title is string => Boolean(title))
  }

  function residentNamesFor(planet: SwapiPlanet): string[] {
    return planet.residents
      .map((url) => residentNamesByUrl.value[url])
      .filter((name): name is string => Boolean(name))
  }

  function toggleFavourite(id: string) {
    const next = isFavourite(id)
      ? favouriteIds.value.filter((favouriteId) => favouriteId !== id)
      : [...favouriteIds.value, id]
    favouriteIds.value = next
    writeStringList(FAVOURITES_KEY, next)
    setPage(currentPage.value)
  }

  function setSearchQuery(value: string) {
    searchQuery.value = value
    setPage(1)
  }

  function toggleFavouritesFilter() {
    showFavouritesOnly.value = !showFavouritesOnly.value
    setPage(1)
  }

  let filmsRequest: Promise<void> | null = null

  async function ensureFilms(): Promise<void> {
    if (Object.keys(filmTitlesByUrl.value).length > 0) return

    if (!filmsRequest) {
      filmsRequest = getFilms()
        .then((films) => {
          filmTitlesByUrl.value = Object.fromEntries(films.map((film) => [film.url, film.title]))
        })
        .catch((error) => {
          filmsRequest = null
          throw error
        })
    }

    await filmsRequest
  }

  let peopleRequest: Promise<void> | null = null

  async function ensurePeople(): Promise<void> {
    if (Object.keys(residentNamesByUrl.value).length > 0) return

    if (!peopleRequest) {
      peopleRequest = getPeople()
        .then((people) => {
          residentNamesByUrl.value = Object.fromEntries(
            people.map((person) => [person.url, person.name]),
          )
        })
        .catch((error) => {
          peopleRequest = null
          throw error
        })
    }

    await peopleRequest
  }

  async function loadCatalogue({ force = false } = {}): Promise<void> {
    listError.value = null

    if (!force && allPlanets.value.length > 0) {
      return
    }

    listLoading.value = true
    try {
      await Promise.all([ensureFilms(), ensurePeople()])
      const planets = await getAllPlanets()
      allPlanets.value = planets
      planets.forEach(cachePlanet)
    } catch (error) {
      listError.value = error instanceof Error ? error.message : 'Failed to load planets'
    } finally {
      listLoading.value = false
      setPage(currentPage.value)
    }
  }

  async function loadPlanet(id: string, { force = false } = {}): Promise<SwapiPlanet | null> {
    detailError.value = null

    if (!force && planetsById.value[id]) {
      return planetsById.value[id]
    }

    detailLoading.value = true
    try {
      await Promise.all([ensureFilms(), ensurePeople()])
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
    allPlanets,
    currentPage,
    pageCount,
    searchQuery,
    showFavouritesOnly,
    favouriteIds,
    listLoading,
    listError,
    detailLoading,
    detailError,
    filteredPlanets,
    listedPlanets,
    isSearching,
    planetsById,
    filmTitlesFor,
    residentNamesFor,
    isFavourite,
    toggleFavourite,
    setPage,
    setSearchQuery,
    toggleFavouritesFilter,
    loadCatalogue,
    loadPlanet,
  }
})
