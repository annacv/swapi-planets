import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { SwapiPlanet } from '@/api/types'

vi.mock('@/api/swapi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/swapi')>()
  return {
    ...actual,
    getAllPlanets: vi.fn<typeof actual.getAllPlanets>(),
    getFilms: vi.fn<typeof actual.getFilms>(),
    getPerson: vi.fn<typeof actual.getPerson>(),
    getPlanet: vi.fn<typeof actual.getPlanet>(),
  }
})

import { getAllPlanets, getFilms } from '@/api/swapi'
import PlanetsView from '../PlanetsView.vue'

const mockedGetAllPlanets = vi.mocked(getAllPlanets)
const mockedGetFilms = vi.mocked(getFilms)

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

function stubMatchMedia() {
  vi.stubGlobal('matchMedia', (query: string): MediaQueryList => {
    return {
      matches: true,
      media: query,
      onchange: null,
      addEventListener: vi.fn<() => void>(),
      removeEventListener: vi.fn<() => void>(),
      dispatchEvent: () => false,
      addListener: vi.fn<() => void>(),
      removeListener: vi.fn<() => void>(),
    }
  })
}

let wrapper: ReturnType<typeof mount> | undefined

async function mountList() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'planets', component: PlanetsView },
      { path: '/planets/:id', name: 'planet-detail', component: { template: '<div />' } },
    ],
  })
  await router.push('/')
  await router.isReady()
  wrapper = mount(PlanetsView, {
    global: { plugins: [pinia, router] },
  })
  return wrapper
}

function statusSection() {
  return wrapper!.get('section[role="status"]')
}

beforeEach(() => {
  localStorage.clear()
  vi.resetAllMocks()
  mockedGetFilms.mockResolvedValue([])
  stubMatchMedia()
})

afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  vi.unstubAllGlobals()
})

describe('PlanetsView', () => {
  it('shows a loading line inside the status section, then a planet row', async () => {
    let resolvePlanets!: (planets: SwapiPlanet[]) => void
    mockedGetAllPlanets.mockReturnValue(
      new Promise((resolve) => {
        resolvePlanets = resolve
      }),
    )

    await mountList()
    await flushPromises()

    expect(statusSection().text()).toContain('Loading planets…')
    expect(mockedGetAllPlanets).toHaveBeenCalledOnce()

    resolvePlanets([makePlanet({ name: 'Tatooine' })])
    await flushPromises()

    expect(wrapper!.text()).toContain('Tatooine')
    expect(wrapper!.text()).not.toContain('Loading planets…')
  })

  it('shows the error and Retry, then loads the row on a second request', async () => {
    let resolvePlanets!: (planets: SwapiPlanet[]) => void
    mockedGetAllPlanets
      .mockRejectedValueOnce(new Error('Could not reach SWAPI'))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePlanets = resolve
          }),
      )

    await mountList()
    await flushPromises()

    expect(statusSection().text()).toContain('Could not reach SWAPI')
    expect(statusSection().get('button').text()).toBe('Retry')
    expect(mockedGetAllPlanets).toHaveBeenCalledOnce()

    await statusSection().get('button').trigger('click')
    await flushPromises()

    expect(statusSection().text()).toContain('Loading planets…')
    expect(mockedGetAllPlanets).toHaveBeenCalledTimes(2)

    resolvePlanets([makePlanet({ name: 'Tatooine' })])
    await flushPromises()

    expect(wrapper!.text()).toContain('Tatooine')
    expect(wrapper!.text()).not.toContain('Loading planets…')
    expect(wrapper!.text()).not.toContain('Could not reach SWAPI')
  })
})
