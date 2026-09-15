import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { usePlanetsStore, PAGE_SIZE } from '../planets'
import type { SwapiPlanet, SwapiFilm } from '@/api/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
  return {
    title: `Film ${index}`,
    url: `https://swapi.dev/api/films/${index}/`,
  }
}

// ---------------------------------------------------------------------------
// Mock the API module so no real HTTP calls are made
// ---------------------------------------------------------------------------
vi.mock('@/api/swapi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/swapi')>()
  return {
    ...actual,
    getAllPlanets: vi.fn(),
    getFilms: vi.fn(),
    getPlanet: vi.fn(),
  }
})

import { getAllPlanets, getFilms, getPlanet } from '@/api/swapi'
const mockedGetAllPlanets = vi.mocked(getAllPlanets)
const mockedGetFilms = vi.mocked(getFilms)
const mockedGetPlanet = vi.mocked(getPlanet)

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
  vi.resetAllMocks()
  mockedGetFilms.mockResolvedValue([])
})

// ===========================================================================
// filteredPlanets
// ===========================================================================
describe('filteredPlanets', () => {
  it('excludes planets with name "unknown"', () => {
    const store = usePlanetsStore()
    store.allPlanets = [
      makePlanet({ name: 'Tatooine', url: 'https://swapi.dev/api/planets/1/' }),
      makePlanet({ name: 'unknown', url: 'https://swapi.dev/api/planets/2/' }),
    ]
    expect(store.filteredPlanets.map((p) => p.name)).toEqual(['Tatooine'])
  })

  it('excludes planets with empty name', () => {
    const store = usePlanetsStore()
    store.allPlanets = [
      makePlanet({ name: '', url: 'https://swapi.dev/api/planets/1/' }),
      makePlanet({ name: 'Hoth', url: 'https://swapi.dev/api/planets/2/' }),
    ]
    expect(store.filteredPlanets.map((p) => p.name)).toEqual(['Hoth'])
  })
})

// ===========================================================================
// filteredPlanets + searchQuery
// ===========================================================================
describe('filteredPlanets + searchQuery', () => {
  it('filters by case-insensitive prefix match', () => {
    const store = usePlanetsStore()
    store.allPlanets = [
      makePlanet({ name: 'Tatooine', url: 'https://swapi.dev/api/planets/1/' }),
      makePlanet({ name: 'Naboo', url: 'https://swapi.dev/api/planets/2/' }),
      makePlanet({ name: 'Takodana', url: 'https://swapi.dev/api/planets/3/' }),
    ]
    store.setSearchQuery('ta')
    expect(store.filteredPlanets.map((p) => p.name)).toEqual(['Tatooine', 'Takodana'])
  })

  it('returns all valid planets when search is empty or whitespace', () => {
    const store = usePlanetsStore()
    store.allPlanets = [
      makePlanet({ name: 'Tatooine', url: 'https://swapi.dev/api/planets/1/' }),
      makePlanet({ name: 'Hoth', url: 'https://swapi.dev/api/planets/2/' }),
    ]
    store.setSearchQuery('   ')
    expect(store.filteredPlanets).toHaveLength(2)
  })
})

// ===========================================================================
// filteredPlanets + showFavouritesOnly
// ===========================================================================
describe('filteredPlanets + showFavouritesOnly', () => {
  it('returns only favourited planets when filter is on', () => {
    const store = usePlanetsStore()
    store.allPlanets = [
      makePlanet({ name: 'Tatooine', url: 'https://swapi.dev/api/planets/1/' }),
      makePlanet({ name: 'Naboo', url: 'https://swapi.dev/api/planets/2/' }),
      makePlanet({ name: 'Hoth', url: 'https://swapi.dev/api/planets/3/' }),
    ]
    store.toggleFavourite('1')
    store.toggleFavouritesFilter()
    expect(store.showFavouritesOnly).toBe(true)
    expect(store.filteredPlanets.map((p) => p.name)).toEqual(['Tatooine'])
  })

  it('returns an empty list when no planets are favourited and filter is on', () => {
    const store = usePlanetsStore()
    store.allPlanets = makePlanets(3)
    store.toggleFavouritesFilter()
    expect(store.filteredPlanets).toEqual([])
  })
})

// ===========================================================================
// listedPlanets (pagination)
// ===========================================================================
describe('listedPlanets', () => {
  it('returns a paged slice of filteredPlanets', () => {
    const store = usePlanetsStore()
    store.allPlanets = makePlanets(PAGE_SIZE + 5)
    expect(store.listedPlanets).toHaveLength(PAGE_SIZE)

    store.setPage(2)
    expect(store.listedPlanets).toHaveLength(5)
  })

  it('returns all filteredPlanets when searching (no pagination)', () => {
    const store = usePlanetsStore()
    store.allPlanets = [
      makePlanet({ name: 'Aa planet', url: 'https://swapi.dev/api/planets/1/' }),
      ...makePlanets(PAGE_SIZE, 10),
      makePlanet({ name: 'Ab planet', url: 'https://swapi.dev/api/planets/99/' }),
    ]
    store.setSearchQuery('A')
    expect(store.isSearching).toBe(true)
    expect(store.listedPlanets.map((p) => p.name)).toEqual(['Aa planet', 'Ab planet'])
  })
})

// ===========================================================================
// setPage
// ===========================================================================
describe('setPage', () => {
  it('clamps to 1 when given a value below 1', () => {
    const store = usePlanetsStore()
    store.allPlanets = makePlanets(5)
    store.setPage(-10)
    expect(store.currentPage).toBe(1)
  })

  it('clamps to pageCount when given a value above maximum', () => {
    const store = usePlanetsStore()
    store.allPlanets = makePlanets(PAGE_SIZE + 1)
    expect(store.pageCount).toBe(2)
    store.setPage(999)
    expect(store.currentPage).toBe(2)
  })
})

// ===========================================================================
// toggleFavourite
// ===========================================================================
describe('toggleFavourite', () => {
  it('adds and removes a planet id from favourites', () => {
    const store = usePlanetsStore()
    store.allPlanets = makePlanets(3)

    store.toggleFavourite('1')
    expect(store.isFavourite('1')).toBe(true)

    store.toggleFavourite('1')
    expect(store.isFavourite('1')).toBe(false)
  })

  it('persists favourites to localStorage', () => {
    const store = usePlanetsStore()
    store.allPlanets = makePlanets(3)

    store.toggleFavourite('2')
    const stored = JSON.parse(localStorage.getItem('swapi-planets:favourites')!)
    expect(stored).toEqual(['2'])
  })

  it('restores favourites from localStorage on store creation', () => {
    localStorage.setItem('swapi-planets:favourites', JSON.stringify(['5', '10']))
    const store = usePlanetsStore()
    expect(store.isFavourite('5')).toBe(true)
    expect(store.isFavourite('10')).toBe(true)
    expect(store.isFavourite('1')).toBe(false)
  })
})

// ===========================================================================
// filmTitlesFor
// ===========================================================================
describe('filmTitlesFor', () => {
  async function storeWithFilms(films: SwapiFilm[]) {
    mockedGetFilms.mockResolvedValue(films)
    mockedGetAllPlanets.mockResolvedValue([])
    const store = usePlanetsStore()
    await store.loadCatalogue()
    return store
  }

  it('maps film URLs to titles using the film lookup', async () => {
    const film1 = makeFilm(1)
    const film2 = makeFilm(2)
    const store = await storeWithFilms([film1, film2])

    const planet = makePlanet({ films: [film1.url, film2.url] })
    expect(store.filmTitlesFor(planet)).toEqual(['Film 1', 'Film 2'])
  })

  it('filters out films whose URL is not in the lookup', async () => {
    const film1 = makeFilm(1)
    const store = await storeWithFilms([film1])

    const planet = makePlanet({
      films: [film1.url, 'https://swapi.dev/api/films/99/'],
    })
    expect(store.filmTitlesFor(planet)).toEqual(['Film 1'])
  })
})

// ===========================================================================
// loadCatalogue
// ===========================================================================
describe('loadCatalogue', () => {
  it('sets loading state and populates allPlanets on success', async () => {
    const planets = makePlanets(3)
    mockedGetAllPlanets.mockResolvedValue(planets)

    const store = usePlanetsStore()
    const promise = store.loadCatalogue()
    expect(store.listLoading).toBe(true)

    await promise
    expect(store.listLoading).toBe(false)
    expect(store.allPlanets).toEqual(planets)
    expect(store.listError).toBeNull()
  })

  it('sets listError on failure', async () => {
    mockedGetAllPlanets.mockRejectedValue(new Error('Network failure'))

    const store = usePlanetsStore()
    await store.loadCatalogue()

    expect(store.listLoading).toBe(false)
    expect(store.listError).toBe('Network failure')
  })

  it('sets a generic error message for non-Error throws', async () => {
    mockedGetAllPlanets.mockRejectedValue('something went wrong')

    const store = usePlanetsStore()
    await store.loadCatalogue()

    expect(store.listError).toBe('Failed to load planets')
  })

  it('skips fetching when planets are already loaded (cache)', async () => {
    const store = usePlanetsStore()
    store.allPlanets = makePlanets(2)
    await store.loadCatalogue()
    expect(mockedGetAllPlanets).not.toHaveBeenCalled()
  })

  it('re-fetches when force is true even if already loaded', async () => {
    const planets = makePlanets(2)
    mockedGetAllPlanets.mockResolvedValue(planets)

    const store = usePlanetsStore()
    store.allPlanets = makePlanets(1)
    await store.loadCatalogue({ force: true })
    expect(mockedGetAllPlanets).toHaveBeenCalledOnce()
    expect(store.allPlanets).toEqual(planets)
  })

  it('caches each planet by id in planetsById', async () => {
    const planets = makePlanets(3)
    mockedGetAllPlanets.mockResolvedValue(planets)

    const store = usePlanetsStore()
    await store.loadCatalogue()
    expect(store.planetsById['1']).toEqual(planets[0])
    expect(store.planetsById['2']).toEqual(planets[1])
    expect(store.planetsById['3']).toEqual(planets[2])
  })
})

// ===========================================================================
// loadPlanet
// ===========================================================================
describe('loadPlanet', () => {
  it('fetches and caches a single planet', async () => {
    const planet = makePlanet({ url: 'https://swapi.dev/api/planets/5/' })
    mockedGetPlanet.mockResolvedValue(planet)

    const store = usePlanetsStore()
    const result = await store.loadPlanet('5')

    expect(result).toEqual(planet)
    expect(store.planetsById['5']).toEqual(planet)
    expect(store.detailLoading).toBe(false)
    expect(store.detailError).toBeNull()
  })

  it('returns cached planet without fetching', async () => {
    const planet = makePlanet({ url: 'https://swapi.dev/api/planets/5/' })
    const store = usePlanetsStore()
    store.planetsById['5'] = planet

    const result = await store.loadPlanet('5')
    expect(result).toEqual(planet)
    expect(mockedGetPlanet).not.toHaveBeenCalled()
  })

  it('re-fetches when force is true', async () => {
    const planet = makePlanet({ url: 'https://swapi.dev/api/planets/5/' })
    mockedGetPlanet.mockResolvedValue(planet)

    const store = usePlanetsStore()
    store.planetsById['5'] = makePlanet({ name: 'Old', url: 'https://swapi.dev/api/planets/5/' })
    const result = await store.loadPlanet('5', { force: true })

    expect(mockedGetPlanet).toHaveBeenCalledOnce()
    expect(result).toEqual(planet)
  })

  it('sets detailError on failure and returns null', async () => {
    mockedGetPlanet.mockRejectedValue(new Error('Not found'))

    const store = usePlanetsStore()
    const result = await store.loadPlanet('999')

    expect(result).toBeNull()
    expect(store.detailError).toBe('Not found')
    expect(store.detailLoading).toBe(false)
  })

  it('sets a generic error message for non-Error throws', async () => {
    mockedGetPlanet.mockRejectedValue(42)

    const store = usePlanetsStore()
    await store.loadPlanet('1')

    expect(store.detailError).toBe('Failed to load planet')
  })

  it('sets detailLoading while fetching', async () => {
    let resolvePromise!: (planet: SwapiPlanet) => void
    mockedGetPlanet.mockReturnValue(
      new Promise<SwapiPlanet>((resolve) => {
        resolvePromise = resolve
      }),
    )

    const store = usePlanetsStore()
    const promise = store.loadPlanet('7')
    expect(store.detailLoading).toBe(true)

    resolvePromise(makePlanet({ url: 'https://swapi.dev/api/planets/7/' }))
    await promise
    expect(store.detailLoading).toBe(false)
  })
})

// ===========================================================================
// setSearchQuery
// ===========================================================================
describe('setSearchQuery', () => {
  it('updates searchQuery and resets page to 1', () => {
    const store = usePlanetsStore()
    store.allPlanets = makePlanets(PAGE_SIZE * 3)
    store.setPage(3)
    expect(store.currentPage).toBe(3)

    store.setSearchQuery('Tat')
    expect(store.searchQuery).toBe('Tat')
    expect(store.currentPage).toBe(1)
  })
})

// ===========================================================================
// toggleFavouritesFilter
// ===========================================================================
describe('toggleFavouritesFilter', () => {
  it('toggles showFavouritesOnly and resets page to 1', () => {
    const store = usePlanetsStore()
    store.allPlanets = makePlanets(PAGE_SIZE * 2)
    store.setPage(2)

    store.toggleFavouritesFilter()
    expect(store.showFavouritesOnly).toBe(true)
    expect(store.currentPage).toBe(1)

    store.toggleFavouritesFilter()
    expect(store.showFavouritesOnly).toBe(false)
    expect(store.currentPage).toBe(1)
  })
})
