export interface SwapiListResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface SwapiPlanet {
  name: string
  rotation_period: string
  orbital_period: string
  diameter: string
  climate: string
  gravity: string
  terrain: string
  surface_water: string
  population: string
  residents: string[]
  films: string[]
  created: string
  edited: string
  url: string
}

export interface SwapiFilm {
  title: string
  url: string
}

export interface SwapiPerson {
  name: string
  url: string
}

export type SwapiPlanetsPage = SwapiListResponse<SwapiPlanet>
export type SwapiFilmsPage = SwapiListResponse<SwapiFilm>
export type SwapiPeoplePage = SwapiListResponse<SwapiPerson>
