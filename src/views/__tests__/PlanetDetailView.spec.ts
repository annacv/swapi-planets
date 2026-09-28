import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import type { SwapiPerson, SwapiPlanet } from '@/api/types'

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

import { getAllPlanets, getFilms, getPerson, getPlanet } from '@/api/swapi'
import PlanetDetailView from '../PlanetDetailView.vue'

const mockedGetAllPlanets = vi.mocked(getAllPlanets)
const mockedGetFilms = vi.mocked(getFilms)
const mockedGetPerson = vi.mocked(getPerson)
const mockedGetPlanet = vi.mocked(getPlanet)

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

async function mountDetail(path: string): Promise<{
  wrapper: ReturnType<typeof mount>
  router: Router
}> {
  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'planets', component: { template: '<div />' } },
      { path: '/planets/:id', name: 'planet-detail', component: PlanetDetailView },
      { path: '/:pathMatch(.*)*', name: 'not-found', component: { template: '<div />' } },
    ],
  })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(PlanetDetailView, {
    global: { plugins: [pinia, router] },
  })
  return { wrapper, router }
}

function residentLine(wrapper: ReturnType<typeof mount>) {
  return wrapper.get('[aria-labelledby="residents-heading"] p')
}

beforeEach(() => {
  localStorage.clear()
  vi.resetAllMocks()
  mockedGetFilms.mockResolvedValue([])
  mockedGetAllPlanets.mockResolvedValue([])
})

describe('PlanetDetailView residents', () => {
  it('shows an italic empty line and does not fetch people', async () => {
    mockedGetPlanet.mockResolvedValue(makePlanet({ name: 'Tatooine', residents: [] }))

    const { wrapper } = await mountDetail('/planets/1')
    await flushPromises()

    const line = residentLine(wrapper)
    expect(line.text()).toBe('No known residents')
    expect(line.classes()).toContain('italic')
    expect(mockedGetPerson).not.toHaveBeenCalled()
  })

  it('paints the planet with a loading line, then the resident names', async () => {
    let resolveLuke!: (person: SwapiPerson) => void
    let rejectC3po!: (error: Error) => void
    mockedGetPerson.mockImplementation((id) => {
      if (String(id) === '1') {
        return new Promise((resolve) => {
          resolveLuke = resolve
        })
      }
      return new Promise((_, reject) => {
        rejectC3po = reject
      })
    })
    mockedGetPlanet.mockResolvedValue(
      makePlanet({
        name: 'Tatooine',
        residents: ['https://swapi.dev/api/people/1/', 'https://swapi.dev/api/people/2/'],
      }),
    )

    const { wrapper } = await mountDetail('/planets/1')
    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('Tatooine')
    expect(residentLine(wrapper).text()).toBe('Loading residents…')
    expect(residentLine(wrapper).classes()).not.toContain('italic')
    expect(mockedGetPerson.mock.invocationCallOrder[0]).toBeLessThan(
      mockedGetAllPlanets.mock.invocationCallOrder[0]!,
    )

    resolveLuke({ name: 'Luke Skywalker', url: 'https://swapi.dev/api/people/1/' })
    await flushPromises()
    expect(residentLine(wrapper).text()).toBe('Luke Skywalker, loading…')

    rejectC3po(new Error('down'))
    await flushPromises()
    expect(residentLine(wrapper).text()).toBe('Luke Skywalker')
    expect(residentLine(wrapper).classes()).not.toContain('italic')
    expect(wrapper.text()).not.toContain('Residents unavailable')
    expect(wrapper.text()).not.toContain('No known residents')
  })

  it('shows an unavailable line when every resident request fails', async () => {
    mockedGetPerson.mockRejectedValue(new Error('down'))
    mockedGetPlanet.mockResolvedValue(
      makePlanet({
        name: 'Tatooine',
        residents: ['https://swapi.dev/api/people/1/'],
      }),
    )

    const { wrapper } = await mountDetail('/planets/1')
    await flushPromises()

    const section = wrapper.get('section[aria-labelledby="residents-heading"]')
    expect(residentLine(wrapper).text()).toBe('Residents unavailable')
    expect(residentLine(wrapper).classes()).not.toContain('italic')
    expect(section.find('button').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('No known residents')
  })

  it('loads residents after retrying a failed planet', async () => {
    let resolvePerson!: (person: SwapiPerson) => void
    mockedGetPerson.mockReturnValue(
      new Promise((resolve) => {
        resolvePerson = resolve
      }),
    )
    mockedGetPlanet.mockRejectedValueOnce(new Error('Not found')).mockResolvedValueOnce(
      makePlanet({
        name: 'Tatooine',
        residents: ['https://swapi.dev/api/people/1/'],
      }),
    )

    const { wrapper } = await mountDetail('/planets/1')
    await flushPromises()
    expect(wrapper.text()).toContain('Not found')
    expect(mockedGetPerson).not.toHaveBeenCalled()

    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.get('h1').text()).toBe('Tatooine')
    expect(residentLine(wrapper).text()).toBe('Loading residents…')

    resolvePerson({ name: 'Luke Skywalker', url: 'https://swapi.dev/api/people/1/' })
    await flushPromises()
    expect(residentLine(wrapper).text()).toBe('Luke Skywalker')
  })

  it('drops follow-up work when a slower planet response is no longer the route', async () => {
    let resolvePlanet1!: (planet: SwapiPlanet) => void
    let resolvePlanet2!: (planet: SwapiPlanet) => void
    mockedGetPerson.mockResolvedValue({
      name: 'Leia Organa',
      url: 'https://swapi.dev/api/people/2/',
    })
    mockedGetPlanet.mockImplementation((id) => {
      return new Promise((resolve) => {
        if (String(id) === '1') resolvePlanet1 = resolve
        else resolvePlanet2 = resolve
      })
    })

    const { router, wrapper } = await mountDetail('/planets/1')
    await router.push('/planets/2')
    await flushPromises()

    resolvePlanet1(
      makePlanet({
        name: 'Tatooine',
        url: 'https://swapi.dev/api/planets/1/',
        residents: ['https://swapi.dev/api/people/1/'],
      }),
    )
    await flushPromises()
    expect(mockedGetPerson).not.toHaveBeenCalled()
    expect(mockedGetAllPlanets).not.toHaveBeenCalled()

    resolvePlanet2(
      makePlanet({
        name: 'Alderaan',
        url: 'https://swapi.dev/api/planets/2/',
        residents: ['https://swapi.dev/api/people/2/'],
      }),
    )
    await flushPromises()
    expect(wrapper.get('h1').text()).toBe('Alderaan')
    expect(residentLine(wrapper).text()).toBe('Leia Organa')
    expect(mockedGetPerson).toHaveBeenCalledOnce()
    expect(mockedGetPerson).toHaveBeenCalledWith('2')
    expect(mockedGetAllPlanets).toHaveBeenCalledOnce()
  })

  it('refetches a failed resident when the planet is opened again', async () => {
    mockedGetPerson.mockRejectedValueOnce(new Error('down'))
    mockedGetPlanet.mockResolvedValue(
      makePlanet({
        name: 'Tatooine',
        residents: ['https://swapi.dev/api/people/1/'],
      }),
    )

    const { wrapper, router } = await mountDetail('/planets/1')
    await flushPromises()
    expect(residentLine(wrapper).text()).toBe('Residents unavailable')

    let resolvePerson!: (person: SwapiPerson) => void
    mockedGetPerson.mockReturnValue(
      new Promise((resolve) => {
        resolvePerson = resolve
      }),
    )
    await router.push('/')
    await router.push('/planets/1')
    await flushPromises()

    expect(residentLine(wrapper).text()).toBe('Loading residents…')
    resolvePerson({ name: 'Luke Skywalker', url: 'https://swapi.dev/api/people/1/' })
    await flushPromises()
    expect(residentLine(wrapper).text()).toBe('Luke Skywalker')
  })
})
