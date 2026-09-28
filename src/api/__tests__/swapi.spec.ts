import { afterEach, describe, expect, it, vi } from 'vitest'
import { getPlanet, personIdFromUrl, planetIdFromUrl } from '../swapi'

function timeoutError(): Error {
  const error = new Error('The operation was aborted due to timeout')
  error.name = 'TimeoutError'
  return error
}

describe('planetIdFromUrl', () => {
  it('extracts the id from valid SWAPI planet URLs', () => {
    expect(planetIdFromUrl('https://swapi.dev/api/planets/1/')).toBe('1')
    expect(planetIdFromUrl('https://swapi.dev/api/planets/42')).toBe('42')
  })

  it('returns null for a malformed URL and does not throw', () => {
    expect(planetIdFromUrl('https://swapi.dev/api/planets/')).toBeNull()
    expect(planetIdFromUrl('https://swapi.dev/api/people/1/')).toBeNull()
    expect(planetIdFromUrl('not-a-url')).toBeNull()
  })
})

describe('personIdFromUrl', () => {
  it('returns the id for a people URL', () => {
    expect(personIdFromUrl('https://swapi.dev/api/people/1/')).toBe('1')
    expect(personIdFromUrl('https://swapi.dev/api/people/42')).toBe('42')
  })

  it('returns null for a malformed URL and does not throw', () => {
    expect(personIdFromUrl('https://swapi.dev/api/people/')).toBeNull()
    expect(personIdFromUrl('https://swapi.dev/api/planets/1/')).toBeNull()
    expect(personIdFromUrl('not-a-url')).toBeNull()
  })
})

describe('getPlanet', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('retries a timeout once, then succeeds with a different signal', async () => {
    const timeout = vi.spyOn(AbortSignal, 'timeout')
    const planet = { name: 'Tatooine' }
    const fetchMock = vi.fn<typeof fetch>()
    fetchMock.mockRejectedValueOnce(timeoutError())
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(planet), { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getPlanet(1)).resolves.toEqual(planet)

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(timeout).toHaveBeenNthCalledWith(1, 10_000)
    expect(timeout).toHaveBeenNthCalledWith(2, 10_000)
    expect(fetchMock.mock.calls[0]?.[0]).toBe('https://swapi.dev/api/planets/1/')
    expect(fetchMock.mock.calls[1]?.[0]).toBe('https://swapi.dev/api/planets/1/')

    const firstSignal = fetchMock.mock.calls[0]?.[1]?.signal
    const secondSignal = fetchMock.mock.calls[1]?.[1]?.signal
    expect(firstSignal).toBeInstanceOf(AbortSignal)
    expect(secondSignal).toBeInstanceOf(AbortSignal)
    expect(firstSignal).not.toBe(secondSignal)
  })

  it('rejects with the timeout message after two timeouts and does not try again', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(timeoutError())
    vi.stubGlobal('fetch', fetchMock)

    await expect(getPlanet(1)).rejects.toThrow('SWAPI request timed out')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('rejects with the reachability message after two network errors', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getPlanet(1)).rejects.toThrow('Could not reach SWAPI')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not retry an HTTP status error', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('', { status: 500, statusText: 'Internal Server Error' }))
    vi.stubGlobal('fetch', fetchMock)

    await expect(getPlanet(1)).rejects.toThrow('SWAPI request failed: 500 Internal Server Error')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
