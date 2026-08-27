import type { SwapiFilm, SwapiFilmsPage, SwapiPlanet, SwapiPlanetsPage } from './types'

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

export function getPlanets(page: number): Promise<SwapiPlanetsPage> {
  return fetchJson<SwapiPlanetsPage>(`/planets/?page=${page}`)
}

export function getPlanet(id: string | number): Promise<SwapiPlanet> {
  return fetchJson<SwapiPlanet>(`/planets/${id}/`)
}

export async function getFilms(): Promise<SwapiFilm[]> {
  const payload = await fetchJson<SwapiFilmsPage>('/films/')
  return payload.results
}
