<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Header -->
    <header class="bg-gray-800 border-b border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <Logo size="md" />
          </div>

          <!-- User Menu -->
          <div class="relative" ref="userMenuRef">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center space-x-2 text-gray-300 hover:text-white"
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
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700"
            >
              <div class="py-1">
                <div class="px-4 py-2 text-sm text-gray-300 border-b border-gray-700">
                  {{ authStore.user?.email }}
                </div>
                <button
                  @click="handleLogout"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center text-red-400">
        <p>{{ error }}</p>
        <button
          @click="fetchConfig"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>

      <!-- Configuration Table -->
      <div v-else>
        <ConfigTable
          :config="config"
          @update="handleUpdate"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </main>

    <!-- Edit Modal -->
    <EditModal
      :show="showEditModal"
      :parameter="editingParameter"
      :is-new-parameter="false"
      @close="closeEditModal"
      @save="saveParameter"
    />

    <!-- Conflict Resolution Modal -->
    <div
      v-if="showConflictModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold text-red-400 mb-4">Configuration Conflict</h3>
        <p class="text-gray-300 mb-4">
          The configuration has been modified by another user. Please refresh to see the latest
          changes.
        </p>
        <div class="flex justify-end">
          <button
            @click="handleConflictRefresh"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useAuth } from '@/composables/useAuth'
import { useConfig } from '@/composables/useConfig'
import ConfigTable from '@/components/ConfigTable.vue'
import EditModal from '@/components/EditModal.vue'
import Logo from '@/components/CompanyLogo.vue'

const authStore = useAuthStore()
const { logout } = useAuth()
const { config, loading, error, fetchConfig, updateConfig } = useConfig()

const showUserMenu = ref(false)
const showEditModal = ref(false)
const showConflictModal = ref(false)
const editingParameter = ref(null)
const userMenuRef = ref(null)

onMounted(async () => {
  await fetchConfig()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event) => {
  if (userMenuRef.value && !userMenuRef.value.contains(event.target)) {
    showUserMenu.value = false
  }
}

const handleLogout = async () => {
  await logout()
}

const handleUpdate = async (updatedConfig) => {
  try {
    await updateConfig(updatedConfig)
  } catch (err) {
    if (err.response?.status === 409) {
      showConflictModal.value = true
    }
  }
}

const handleEdit = (parameter) => {
  editingParameter.value = parameter
  showEditModal.value = true
}

const handleDelete = async (updatedConfig) => {
  try {
    await updateConfig(updatedConfig)
  } catch (err) {
    if (err.response?.status === 409) {
      showConflictModal.value = true
    }
  }
}

const closeEditModal = () => {
  showEditModal.value = false
  editingParameter.value = null
}

const saveParameter = async (parameterData) => {
  try {
    const updatedConfig = {
      ...config.value,
      [parameterData.key]: {
        value: parameterData.value,
        description: parameterData.description,
        createDate: parameterData.createDate || Date.now(),
      },
    }
    await updateConfig(updatedConfig)
    closeEditModal()
  } catch (err) {
    if (err.response?.status === 409) {
      showConflictModal.value = true
      closeEditModal()
    }
  }
}

const handleConflictRefresh = async () => {
  showConflictModal.value = false
  await fetchConfig()
}
</script>
