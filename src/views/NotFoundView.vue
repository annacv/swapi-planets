<template>
  <main class="flex min-h-screen flex-col items-center px-8 md:px-16 pb-10 pt-10 lg:pt-24 xl:px-32">
    <p class="mt-10 text-xl text-center text-muted">This page does not exist</p>
    <RouterLink
      :to="{ name: 'planets' }"
      class="mt-3 font-semibold text-ember hover:underline text-sm"
    >
      ← Back to planets
    </RouterLink>
  </main>
</template>
