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
          <UserMenu @logout="handleLogout" />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Loading State -->
      <LoadingSpinner v-if="loading" />

      <!-- Error State -->
      <ErrorMessage v-else-if="error" :error="error" @retry="fetchConfig" />

      <!-- Configuration Table -->
      <div v-else>
        <ConfigTable
          :config="config"
          @update="handleUpdate"
          @edit="handleEdit"
          @delete="handleDelete"
          @manage-countries="handleManageCountries"
        />
      </div>
    </main>

    <!-- Modals -->
    <EditModal
      :show="showEditModal"
      :parameter="editingParameter"
      :is-new-parameter="false"
      @close="closeEditModal"
      @save="saveParameter"
    />

    <CountryModal
      :show="showCountryModal"
      :parameter-key="countryParameter?.key"
      :default-value="countryParameter?.value"
      :country-values-data="countryParameter?.countryValues"
      @close="closeCountryModal"
      @save="saveCountryValues"
    />

    <ConflictModal
      :show="showConflictModal"
      @close="showConflictModal = false"
      @refresh="handleConflictRefresh"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useConfig } from '@/composables/useConfig'
import ConfigTable from '@/components/ConfigTable.vue'
import EditModal from '@/components/EditModal.vue'
import CountryModal from '@/components/CountryModal.vue'
import Logo from '@/components/CompanyLogo.vue'
import UserMenu from '@/components/UserMenu.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import ConflictModal from '@/components/ConflictModal.vue'

const { logout } = useAuth()
const { config, loading, error, fetchConfig, updateConfig } = useConfig()

// Modal states
const modals = {
  edit: ref(false),
  country: ref(false),
  conflict: ref(false),
}

const showEditModal = modals.edit
const showCountryModal = modals.country
const showConflictModal = modals.conflict

const editingParameter = ref(null)
const countryParameter = ref(null)

onMounted(async () => {
  await fetchConfig()
})

// Event handlers with error handling
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

const handleManageCountries = (parameter) => {
  countryParameter.value = parameter
  showCountryModal.value = true
}

const handleLogout = async () => {
  await logout()
}

// Modal management
const closeModal = (modalName) => {
  if (modals[modalName]) {
    modals[modalName].value = false
  }

  // Reset related data
  if (modalName === 'edit') {
    editingParameter.value = null
  } else if (modalName === 'country') {
    countryParameter.value = null
  }
}

const closeEditModal = () => closeModal('edit')
const closeCountryModal = () => closeModal('country')

const saveParameter = async (parameterData) => {
  try {
    const updatedConfig = {
      ...config.value,
      [parameterData.key]: {
        value: parameterData.value,
        description: parameterData.description,
        createDate: parameterData.createDate || Date.now(),
        countryValues: parameterData.countryValues || {},
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

const saveCountryValues = async (countryValues) => {
  try {
    const updatedConfig = {
      ...config.value,
      [countryParameter.value.key]: {
        ...config.value[countryParameter.value.key],
        countryValues: countryValues,
      },
    }
    await updateConfig(updatedConfig)
    closeCountryModal()
  } catch (err) {
    if (err.response?.status === 409) {
      showConflictModal.value = true
      closeCountryModal()
    }
  }
}

const handleConflictRefresh = async () => {
  showConflictModal.value = false
  await fetchConfig()
}
</script>
