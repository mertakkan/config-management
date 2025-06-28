<template>
  <div class="flex items-center">
    <img :src="logoUrl" alt="CompanyLogo" :class="['object-contain', sizeClass]" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'sm', // sm, md, lg, xl
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value),
  },
})

import logoImg from '@/assets/icon.png'

const logoUrl = logoImg

const sizeClass = computed(() => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-48 h-48',
  }
  return sizes[props.size]
})
</script>
