import type { SwapiFilm, SwapiFilmsPage, SwapiPerson, SwapiPlanet, SwapiPlanetsPage } from './types'

const SWAPI_BASE_URL = 'https://swapi.dev/api'
const REQUEST_TIMEOUT_MS = 10_000

function isTransientFetchError(error: unknown): boolean {
  return error instanceof Error && (error.name === 'TimeoutError' || error.name === 'TypeError')
}

function describedFetchError(error: unknown): unknown {
  if (!(error instanceof Error)) {
    return error
  }
  if (error.name === 'TimeoutError') {
    return new Error('SWAPI request timed out')
  }
  if (error.name === 'TypeError') {
    return new Error('Could not reach SWAPI')
  }
  return error
}

async function fetchJsonOnce<T>(url: string): Promise<T> {
  // A fresh signal per attempt. A shared timeout is already expired when the retry starts.
  const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })

  if (!response.ok) {
    throw new Error(`SWAPI request failed: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${SWAPI_BASE_URL}${path}`

  try {
    return await fetchJsonOnce<T>(url)
  } catch (error) {
    if (!isTransientFetchError(error)) {
      throw describedFetchError(error)
    }
  }

  try {
    return await fetchJsonOnce<T>(url)
  } catch (error) {
    throw describedFetchError(error)
  }
}

export function planetIdFromUrl(url: string): string | null {
  const match = url.match(/\/planets\/(\d+)\/?$/)
  return match?.[1] ?? null
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
