import type { SwapiFilm, SwapiFilmsPage, SwapiPerson, SwapiPlanet, SwapiPlanetsPage } from './types'

const SWAPI_BASE_URL = 'https://swapi.dev/api'

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${SWAPI_BASE_URL}${path}`)

  if (!response.ok) {
    throw new Error(`SWAPI request failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export function planetIdFromUrl(url: string): string {
  const match = url.match(/\/planets\/(\d+)\/?$/)
  const id = match?.[1]

  if (!id) {
    throw new Error(`Could not extract planet id from URL: ${url}`)
  }

  return id
}

export function personIdFromUrl(url: string): string | null {
  const match = url.match(/\/people\/(\d+)\/?$/)
  return match?.[1] ?? null
}

export function getPlanets(page: number): Promise<SwapiPlanetsPage> {
  return fetchJson<SwapiPlanetsPage>(`/planets/?page=${page}`)
}

export async function getAllPlanets(): Promise<SwapiPlanet[]> {
  const firstPage = await getPlanets(1)
  const pageSize = firstPage.results.length || 10
  const totalPages = Math.ceil(firstPage.count / pageSize)

  if (totalPages <= 1) {
    return firstPage.results
  }

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => getPlanets(index + 2)),
  )

  return firstPage.results.concat(...remainingPages.map((page) => page.results))
}

export function getPlanet(id: string | number): Promise<SwapiPlanet> {
  return fetchJson<SwapiPlanet>(`/planets/${id}/`)
}

export async function getFilms(): Promise<SwapiFilm[]> {
  const payload = await fetchJson<SwapiFilmsPage>('/films/')
  return payload.results
}

// Take an id, not the resident URL: SWAPI lists some people as http://, which would be mixed content.
export function getPerson(id: string | number): Promise<SwapiPerson> {
  return fetchJson<SwapiPerson>(`/people/${id}/`)
}
