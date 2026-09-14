<script setup lang="ts">
import heartSvg from '@/assets/images/heart-icon.svg?raw'

defineProps<{
  active: boolean
}>()
</script>

<template>
  <span
    class="inline-block size-[20px] [&_svg]:block [&_svg]:size-full"
    :class="active ? 'text-star' : 'text-heart'"
    aria-hidden="true"
    v-html="heartSvg"
  />
</template>
