import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import LikeButton from '../LikeButton.vue'
import { usePlanetsStore } from '@/stores/planets'

const FAVOURITES_KEY = 'swapi-planets:favourites'

beforeEach(() => {
  localStorage.clear()
})

function mountButton() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const wrapper = mount(LikeButton, {
    props: { planetId: '1', planetName: 'Tatooine' },
    global: { plugins: [pinia] },
  })
  return { wrapper, store: usePlanetsStore() }
}

describe('LikeButton', () => {
  it('flips the pressed state and label, and writes the id to favourites', async () => {
    const { wrapper, store } = mountButton()
    const button = wrapper.get('button')

    expect(button.attributes('aria-pressed')).toBe('false')
    expect(button.attributes('aria-label')).toBe('Add Tatooine to favourites')
    expect(store.favouriteIds).toEqual([])

    await button.trigger('click')

    expect(button.attributes('aria-pressed')).toBe('true')
    expect(button.attributes('aria-label')).toBe('Remove Tatooine from favourites')
    expect(store.favouriteIds).toEqual(['1'])
    expect(JSON.parse(localStorage.getItem(FAVOURITES_KEY) ?? 'null')).toEqual(['1'])

    await button.trigger('click')

    expect(button.attributes('aria-pressed')).toBe('false')
    expect(button.attributes('aria-label')).toBe('Add Tatooine to favourites')
    expect(store.favouriteIds).toEqual([])
    expect(JSON.parse(localStorage.getItem(FAVOURITES_KEY) ?? 'null')).toEqual([])
  })
})
