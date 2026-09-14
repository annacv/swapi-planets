<script setup lang="ts">
import galaxy from '@/assets/images/bg-galaxy.svg'
</script>

<template>
  <div class="relative min-h-dvh bg-galaxy font-sans text-star">
    <div class="pointer-events-none absolute inset-0 z-0 overflow-clip" aria-hidden="true">
      <img :src="galaxy" alt="" class="galaxy-spin absolute left-1/2 top-1/2 max-w-none select-none" />
    </div>
    <header class="absolute z-20 pointer-events-none px-4 py-2 w-full">
      <a
        href="https://swapi.dev/"
        target="_blank"
        rel="noopener noreferrer"
        class="uppercase pointer-events-auto text-xs font-bold leading-none text-flame"
      >
        Star Wars planets via SWAPI
      </a>
    </header>
    <div class="relative z-10">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.galaxy-spin {
  width: 150vmax;
  height: 150vmax;
  object-fit: cover;
  animation: galaxy-spin 800s linear infinite;
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
