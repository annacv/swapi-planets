import { createRouter, createWebHistory } from 'vue-router'

import NotFoundView from '@/views/NotFoundView.vue'
import PlanetDetailView from '@/views/PlanetDetailView.vue'
import PlanetsView from '@/views/PlanetsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior() {
    return { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'planets',
      component: PlanetsView,
    },
    {
      path: '/planets/:id',
      name: 'planet-detail',
      component: PlanetDetailView,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
    },
  ],
})

export default router
