<script setup lang="ts">
import logo from '@/assets/images/acondal.svg'

const galaxy = `${import.meta.env.BASE_URL}bg-galaxy.svg`
</script>

<template>
  <div class="relative min-h-dvh bg-galaxy font-sans text-star">
    <div
      class="pointer-events-none absolute inset-x-0 top-0 z-0 h-dvh overflow-clip lg:inset-0 lg:h-auto"
      aria-hidden="true"
    >
      <img
        :src="galaxy"
        alt=""
        width="3000"
        height="1800"
        fetchpriority="high"
        class="galaxy-spin absolute left-1/2 top-1/2 max-w-none select-none"
      />
    </div>
    <header class="absolute z-20 pointer-events-none px-4 py-2 w-full">
      <h1>
        <a
          href="https://swapi.dev/"
          target="_blank"
          rel="noopener noreferrer"
          class="uppercase pointer-events-auto text-xs font-bold leading-none text-flame"
        >
          Star Wars planets via SWAPI
        </a>
      </h1>
    </header>
    <RouterView class="relative z-10" />
    <footer class="absolute bottom-0 z-20 pointer-events-none px-4 py-2 w-full">
      <a
        href="https://github.com/annacv"
        target="_blank"
        rel="noopener"
        class="pointer-events-auto inline-flex items-center gap-1.5 text-xs text-star"
      >
        <span>By</span>
        <img :src="logo" alt="author logo" width="32" height="16" class="h-4 w-8" />
      </a>
    </footer>
  </div>
</template>

<style scoped>
.galaxy-spin {
  width: 100vmax;
  height: 100vmax;
  object-fit: contain;
  animation: galaxy-spin 600s linear infinite;
}

@keyframes galaxy-spin {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .galaxy-spin {
    animation: none;
    transform: translate(-50%, -50%);
  }
}
</style>
