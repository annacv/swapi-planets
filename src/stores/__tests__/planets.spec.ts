import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlanetsStore, PAGE_SIZE } from '../planets'
import type { SwapiPlanet, SwapiFilm } from '@/api/types'

function makePlanet(overrides: Partial<SwapiPlanet> = {}): SwapiPlanet {
  const id = overrides.url?.match(/\/planets\/(\d+)/)?.[1] ?? '1'
  return {
    name: `Planet ${id}`,
    rotation_period: '24',
    orbital_period: '365',
    diameter: '10000',
    climate: 'temperate',
    gravity: '1 standard',
    terrain: 'grasslands',
    surface_water: '40',
    population: '1000000',
    residents: [],
    films: [],
    created: '',
    edited: '',
    url: `https://swapi.dev/api/planets/${id}/`,
    ...overrides,
  }
}

function makePlanets(count: number, startId = 1): SwapiPlanet[] {
  return Array.from({ length: count }, (_, i) =>
    makePlanet({ url: `https://swapi.dev/api/planets/${startId + i}/` }),
  )
}

function makeFilm(index: number): SwapiFilm {
  return { title: `Film ${index}`, url: `https://swapi.dev/api/films/${index}/` }
}

vi.mock('@/api/swapi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/swapi')>()
  return {
    ...actual,
    getAllPlanets: vi.fn<typeof actual.getAllPlanets>(),
    getFilms: vi.fn<typeof actual.getFilms>(),
    getPlanet: vi.fn<typeof actual.getPlanet>(),
  }
})

import { getAllPlanets, getFilms, getPlanet } from '@/api/swapi'
const mockedGetAllPlanets = vi.mocked(getAllPlanets)
const mockedGetFilms = vi.mocked(getFilms)
const mockedGetPlanet = vi.mocked(getPlanet)

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  vi.resetAllMocks()
  mockedGetFilms.mockResolvedValue([])
})

// ---------------------------------------------------------------------------
// filteredPlanets — filtering, search, favourites
// ---------------------------------------------------------------------------
describe('filteredPlanets', () => {
  it('excludes planets with name "unknown" and applies case-insensitive prefix search', () => {
    const store = usePlanetsStore()
    store.allPlanets = [
      makePlanet({ name: 'Tatooine', url: 'https://swapi.dev/api/planets/1/' }),
      makePlanet({ name: 'unknown', url: 'https://swapi.dev/api/planets/2/' }),
      makePlanet({ name: 'Takodana', url: 'https://swapi.dev/api/planets/3/' }),
    ]

    expect(store.filteredPlanets.map((p) => p.name)).toEqual(['Tatooine', 'Takodana'])

    store.setSearchQuery('ta')
    expect(store.filteredPlanets.map((p) => p.name)).toEqual(['Tatooine', 'Takodana'])

    store.setSearchQuery('tat')
    expect(store.filteredPlanets.map((p) => p.name)).toEqual(['Tatooine'])
  })

  it('returns only favourited planets when showFavouritesOnly is on', () => {
    const store = usePlanetsStore()
    store.allPlanets = [
      makePlanet({ name: 'Tatooine', url: 'https://swapi.dev/api/planets/1/' }),
      makePlanet({ name: 'Naboo', url: 'https://swapi.dev/api/planets/2/' }),
    ]
    store.toggleFavourite('1')
    store.toggleFavouritesFilter()
    expect(store.filteredPlanets.map((p) => p.name)).toEqual(['Tatooine'])
  })
})

// ---------------------------------------------------------------------------
// listedPlanets — pagination vs search
// ---------------------------------------------------------------------------
describe('listedPlanets', () => {
  it('returns a paged slice normally', () => {
    const store = usePlanetsStore()
    store.allPlanets = makePlanets(PAGE_SIZE + 5)
    expect(store.listedPlanets).toHaveLength(PAGE_SIZE)

    store.setPage(2)
    expect(store.listedPlanets).toHaveLength(5)
  })

  it('returns all matching planets when searching (bypasses pagination)', () => {
    const store = usePlanetsStore()
    store.allPlanets = [
      makePlanet({ name: 'Aa planet', url: 'https://swapi.dev/api/planets/1/' }),
      ...makePlanets(PAGE_SIZE, 10),
      makePlanet({ name: 'Ab planet', url: 'https://swapi.dev/api/planets/99/' }),
    ]
    store.setSearchQuery('A')
    expect(store.listedPlanets.map((p) => p.name)).toEqual(['Aa planet', 'Ab planet'])
  })
})

// ---------------------------------------------------------------------------
// setPage — clamping
// ---------------------------------------------------------------------------
describe('setPage', () => {
  it('clamps to valid range', () => {
    const store = usePlanetsStore()
    store.allPlanets = makePlanets(PAGE_SIZE + 1)
    store.setPage(-10)
    expect(store.currentPage).toBe(1)
    store.setPage(999)
    expect(store.currentPage).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// toggleFavourite — state + persistence
// ---------------------------------------------------------------------------
describe('toggleFavourite', () => {
  it('adds/removes ids and persists to localStorage', () => {
    const store = usePlanetsStore()
    store.allPlanets = makePlanets(3)

    store.toggleFavourite('1')
    expect(store.isFavourite('1')).toBe(true)
    expect(JSON.parse(localStorage.getItem('swapi-planets:favourites')!)).toEqual(['1'])

    store.toggleFavourite('1')
    expect(store.isFavourite('1')).toBe(false)
  })

  it('restores favourites from localStorage on store creation', () => {
    localStorage.setItem('swapi-planets:favourites', JSON.stringify(['5', '10']))
    const store = usePlanetsStore()
    expect(store.isFavourite('5')).toBe(true)
    expect(store.isFavourite('1')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// filmTitlesFor
// ---------------------------------------------------------------------------
describe('filmTitlesFor', () => {
  it('maps film URLs to titles and filters out missing ones', async () => {
    const film1 = makeFilm(1)
    mockedGetFilms.mockResolvedValue([film1])
    mockedGetAllPlanets.mockResolvedValue([])
    const store = usePlanetsStore()
    await store.loadCatalogue()

    const planet = makePlanet({ films: [film1.url, 'https://swapi.dev/api/films/99/'] })
    expect(store.filmTitlesFor(planet)).toEqual(['Film 1'])
  })
})

// ---------------------------------------------------------------------------
// loadCatalogue
// ---------------------------------------------------------------------------
describe('loadCatalogue', () => {
  it('fetches, populates allPlanets, and caches by id', async () => {
    const planets = makePlanets(3)
    mockedGetAllPlanets.mockResolvedValue(planets)

    const store = usePlanetsStore()
    const promise = store.loadCatalogue()
    expect(store.listLoading).toBe(true)

    await promise
    expect(store.listLoading).toBe(false)
    expect(store.allPlanets).toEqual(planets)
    expect(store.planetsById['1']).toEqual(planets[0])
    expect(store.listError).toBeNull()
  })

  it('sets listError on failure', async () => {
    mockedGetAllPlanets.mockRejectedValue(new Error('Network failure'))
    const store = usePlanetsStore()
    await store.loadCatalogue()
    expect(store.listError).toBe('Network failure')
  })

  it('uses cache by default and re-fetches when force is true', async () => {
    const store = usePlanetsStore()
    store.allPlanets = makePlanets(1)
    await store.loadCatalogue()
    expect(mockedGetAllPlanets).not.toHaveBeenCalled()

    mockedGetAllPlanets.mockResolvedValue(makePlanets(2))
    await store.loadCatalogue({ force: true })
    expect(mockedGetAllPlanets).toHaveBeenCalledOnce()
    expect(store.allPlanets).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// loadPlanet
// ---------------------------------------------------------------------------
describe('loadPlanet', () => {
  it('fetches, caches, and tracks loading state', async () => {
    const planet = makePlanet({ url: 'https://swapi.dev/api/planets/5/' })
    mockedGetPlanet.mockResolvedValue(planet)

    const store = usePlanetsStore()
    const promise = store.loadPlanet('5')
    expect(store.detailLoading).toBe(true)

    const result = await promise
    expect(result).toEqual(planet)
    expect(store.planetsById['5']).toEqual(planet)
    expect(store.detailLoading).toBe(false)
  })

  it('uses cache by default and re-fetches when force is true', async () => {
    const cached = makePlanet({ name: 'Old', url: 'https://swapi.dev/api/planets/5/' })
    const fresh = makePlanet({ url: 'https://swapi.dev/api/planets/5/' })
    mockedGetPlanet.mockResolvedValue(fresh)

    const store = usePlanetsStore()
    store.planetsById['5'] = cached

    expect(await store.loadPlanet('5')).toEqual(cached)
    expect(mockedGetPlanet).not.toHaveBeenCalled()

    expect(await store.loadPlanet('5', { force: true })).toEqual(fresh)
    expect(mockedGetPlanet).toHaveBeenCalledOnce()
  })

  it('sets detailError on failure and returns null', async () => {
    mockedGetPlanet.mockRejectedValue(new Error('Not found'))
    const store = usePlanetsStore()
    expect(await store.loadPlanet('999')).toBeNull()
    expect(store.detailError).toBe('Not found')
  })

  it('dedupes concurrent film fetches when loading planet and catalogue together', async () => {
    let resolveFilms!: (films: SwapiFilm[]) => void
    mockedGetFilms.mockReturnValue(
      new Promise<SwapiFilm[]>((resolve) => {
        resolveFilms = resolve
      }),
    )
    const film = makeFilm(1)
    mockedGetPlanet.mockResolvedValue(
      makePlanet({ url: 'https://swapi.dev/api/planets/5/', films: [film.url] }),
    )
    mockedGetAllPlanets.mockResolvedValue(makePlanets(2))

    const store = usePlanetsStore()
    const planetPromise = store.loadPlanet('5')
    const cataloguePromise = store.loadCatalogue()

    expect(mockedGetFilms).toHaveBeenCalledOnce()
    resolveFilms([film])

    await Promise.all([planetPromise, cataloguePromise])
    expect(mockedGetFilms).toHaveBeenCalledOnce()
    expect(store.filmTitlesFor(store.planetsById['5']!)).toEqual(['Film 1'])
  })
})

// ---------------------------------------------------------------------------
// setSearchQuery / toggleFavouritesFilter — page reset
// ---------------------------------------------------------------------------
describe('setSearchQuery', () => {
  it('updates searchQuery and resets page to 1', () => {
    const store = usePlanetsStore()
    store.allPlanets = makePlanets(PAGE_SIZE * 3)
    store.setPage(3)
    store.setSearchQuery('Tat')
    expect(store.searchQuery).toBe('Tat')
    expect(store.currentPage).toBe(1)
  })
})

describe('toggleFavouritesFilter', () => {
  it('toggles showFavouritesOnly and resets page to 1', () => {
    const store = usePlanetsStore()
    store.allPlanets = makePlanets(PAGE_SIZE * 2)
    store.setPage(2)
    store.toggleFavouritesFilter()
    expect(store.showFavouritesOnly).toBe(true)
    expect(store.currentPage).toBe(1)
  })
})
