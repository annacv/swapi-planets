import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  getAllPlanets,
  getFilms,
  getPerson,
  getPlanet,
  personIdFromUrl,
  planetIdFromUrl,
} from '@/api/swapi'
import type { SwapiPlanet } from '@/api/types'
import { pageCountFor, pageSlice } from '@/utils/pagination'
import { readStringList, writeStringList } from '@/utils/storage'

const FAVOURITES_KEY = 'swapi-planets:favourites'
export const PAGE_SIZE = 10

export const usePlanetsStore = defineStore('planets', () => {
  const filmTitlesByUrl = ref<Record<string, string>>({})
  const residentNamesByUrl = ref<Record<string, string>>({})
  const failedResidentUrls = ref<Record<string, true>>({})
  const residentRequests = new Map<string, Promise<void>>()
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

  function residentsStatusFor(planet: SwapiPlanet): 'empty' | 'loading' | 'ready' | 'unavailable' {
    if (planet.residents.length === 0) return 'empty'

    let named = 0
    let failed = 0
    for (const url of planet.residents) {
      if (residentNamesByUrl.value[url]) named += 1
      else if (failedResidentUrls.value[url]) failed += 1
    }

    if (named + failed < planet.residents.length) return 'loading'
    if (named > 0) return 'ready'
    return 'unavailable'
  }

  function rememberResidentFailure(url: string) {
    failedResidentUrls.value = { ...failedResidentUrls.value, [url]: true }
  }

  function forgetResidentFailure(url: string) {
    if (!failedResidentUrls.value[url]) return
    const next = { ...failedResidentUrls.value }
    delete next[url]
    failedResidentUrls.value = next
  }

  function fetchResident(url: string): Promise<void> {
    if (residentNamesByUrl.value[url]) return Promise.resolve()

    const inFlight = residentRequests.get(url)
    if (inFlight) return inFlight

    const id = personIdFromUrl(url)
    if (!id) {
      rememberResidentFailure(url)
      return Promise.resolve()
    }

    forgetResidentFailure(url)

    const request = Promise.resolve(getPerson(id))
      .then((person) => {
        residentNamesByUrl.value = { ...residentNamesByUrl.value, [url]: person.name }
      })
      .catch(() => {
        rememberResidentFailure(url)
      })
      .finally(() => {
        residentRequests.delete(url)
      })

    residentRequests.set(url, request)
    return request
  }

  async function loadResidents(urls: string[]): Promise<void> {
    await Promise.allSettled(urls.map((url) => fetchResident(url)))
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

  async function loadCatalogue({ force = false } = {}): Promise<void> {
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
      // Films are one request both views need before first paint; residents load after.
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
    residentsStatusFor,
    loadResidents,
    isFavourite,
    toggleFavourite,
    setPage,
    setSearchQuery,
    toggleFavouritesFilter,
    loadCatalogue,
    loadPlanet,
  }
})
