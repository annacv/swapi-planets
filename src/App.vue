<script setup lang="ts">
import galaxy from '@/assets/images/bg-galaxy.svg'
</script>

<template>
  <div
    class="min-h-screen overflow-x-hidden bg-galaxy bg-cover bg-center font-sans text-star"
    :style="{ backgroundImage: `url(${galaxy})` }"
  >
    <header class="absolute z-20 pointer-events-none px-4 py-2 w-full">
      <RouterLink to="/planets" class="uppercase pointer-events-auto text-xs font-bold leading-none text-flame">
        Star Wars planets via SWAPI
      </RouterLink>
    </header>
    <RouterView />
  </div>
</template>
