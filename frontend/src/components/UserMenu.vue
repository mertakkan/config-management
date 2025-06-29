<template>
  <div class="relative" ref="menuRef">
    <button
      @click="toggleMenu"
      class="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-md p-1"
    >
      <div class="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="showMenu"
        class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-10"
      >
        <div class="py-1">
          <div class="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
            {{ authStore.user?.email }}
          </div>
          <button
            @click="handleLogout"
            class="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors duration-150"
          >
            Sign out
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['logout'])

const authStore = useAuthStore()
const showMenu = ref(false)
const menuRef = ref(null)

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const handleClickOutside = (event) => {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    showMenu.value = false
  }
}

const handleLogout = () => {
  showMenu.value = false
  emit('logout')
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
