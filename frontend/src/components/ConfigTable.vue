<template>
  <div class="bg-gray-800 rounded-lg overflow-hidden">
    <!-- Desktop Table -->
    <div class="hidden md:block">
      <table class="w-full">
        <thead class="bg-gray-700">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Parameter Key</th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Value</th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Description</th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">
              Create Date
              <button @click="toggleSort" class="ml-2 text-gray-400 hover:text-white">↑↓</button>
            </th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Countries</th>
            <th class="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-700">
          <tr v-for="(item, key) in sortedConfig" :key="key" class="hover:bg-gray-700">
            <td class="px-6 py-4 text-sm text-white">{{ key }}</td>
            <td class="px-6 py-4 text-sm text-white">{{ formatValue(item.value) }}</td>
            <td class="px-6 py-4 text-sm text-gray-300">{{ item.description }}</td>
            <td class="px-6 py-4 text-sm text-gray-300">{{ formatDate(item.createDate) }}</td>
            <td class="px-6 py-4 text-sm text-gray-300">
              <span v-if="getCountryCount(item) > 0" class="text-blue-400">
                {{ getCountryCount(item) }} countries
              </span>
              <span v-else class="text-gray-500">Default only</span>
            </td>
            <td class="px-6 py-4 text-sm">
              <div class="flex space-x-2">
                <button
                  @click="editParameter(key, item)"
                  class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit
                </button>
                <button
                  @click="manageCountries(key, item)"
                  class="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                >
                  Countries
                </button>
                <button
                  @click="deleteParameter(key)"
                  class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-4 p-4">
      <div
        v-for="(item, key) in sortedConfig"
        :key="key"
        class="bg-gray-700 rounded-lg p-4 border border-gray-600"
      >
        <div class="space-y-3">
          <div>
            <span class="text-sm text-gray-400">Parameter Key:</span>
            <span class="text-white ml-2">{{ key }}</span>
          </div>
          <div>
            <span class="text-sm text-gray-400">Value:</span>
            <span class="text-white ml-2">{{ formatValue(item.value) }}</span>
          </div>
          <div>
            <span class="text-sm text-gray-400">Description:</span>
            <span class="text-gray-300 ml-2">{{ item.description }}</span>
          </div>
          <div>
            <span class="text-sm text-gray-400">Create Date:</span>
            <span class="text-gray-300 ml-2">{{ formatDate(item.createDate) }}</span>
          </div>
          <div>
            <span class="text-sm text-gray-400">Countries:</span>
            <span v-if="getCountryCount(item) > 0" class="text-blue-400 ml-2">
              {{ getCountryCount(item) }} countries
            </span>
            <span v-else class="text-gray-500 ml-2">Default only</span>
          </div>
          <div class="flex space-x-2 pt-2">
            <button
              @click="editParameter(key, item)"
              class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              Edit
            </button>
            <button
              @click="manageCountries(key, item)"
              class="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
            >
              Countries
            </button>
            <button
              @click="deleteParameter(key)"
              class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add New Parameter Form -->
    <div class="bg-gray-700 p-4 border-t border-gray-600">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="newParameter.key"
          placeholder="New Parameter"
          class="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
          @keyup.enter="addParameter"
        />
        <input
          v-model="newParameter.value"
          placeholder="Value"
          class="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
          @keyup.enter="addParameter"
        />
        <input
          v-model="newParameter.description"
          placeholder="New Description"
          class="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
          @keyup.enter="addParameter"
        />
        <button
          @click="addParameter"
          :disabled="!canAddParameter"
          class="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ADD
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { formatDate } from '@/utils/dateFormatter'

const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update', 'edit', 'delete', 'manage-countries'])

const sortAscending = ref(true)
const newParameter = ref({
  key: '',
  value: '',
  description: '',
})

const configItems = computed(() => {
  const items = {}
  Object.entries(props.config).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      items[key] = value
    } else {
      // Convert simple values to object format
      items[key] = {
        value: value,
        description: getDefaultDescription(key),
        createDate: Date.now(),
        countryValues: {},
      }
    }
  })
  return items
})

const sortedConfig = computed(() => {
  const entries = Object.entries(configItems.value)
  return Object.fromEntries(
    entries.sort(([, a], [, b]) => {
      const dateA = new Date(a.createDate || 0)
      const dateB = new Date(b.createDate || 0)
      return sortAscending.value ? dateA - dateB : dateB - dateA
    }),
  )
})

const canAddParameter = computed(() => {
  return (
    newParameter.value.key &&
    newParameter.value.value &&
    newParameter.value.description &&
    !Object.prototype.hasOwnProperty.call(props.config, newParameter.value.key)
  )
})

const getCountryCount = (item) => {
  return Object.keys(item.countryValues || {}).length
}

const formatValue = (value) => {
  if (typeof value === 'string' && value.length > 50) {
    return value.substring(0, 50) + '...'
  }
  return value
}

const toggleSort = () => {
  sortAscending.value = !sortAscending.value
}

const addParameter = () => {
  if (!canAddParameter.value) return

  const updatedConfig = {
    ...props.config,
    [newParameter.value.key]: {
      value: newParameter.value.value,
      description: newParameter.value.description,
      createDate: Date.now(),
      countryValues: {},
    },
  }

  emit('update', updatedConfig)

  // Reset form
  newParameter.value = {
    key: '',
    value: '',
    description: '',
  }
}

const editParameter = (key, item) => {
  emit('edit', { key, ...item })
}

const manageCountries = (key, item) => {
  emit('manage-countries', { key, ...item })
}

const deleteParameter = (key) => {
  if (confirm(`Are you sure you want to delete "${key}"?`)) {
    const updatedConfig = { ...props.config }
    delete updatedConfig[key]
    emit('delete', updatedConfig)
  }
}

const getDefaultDescription = (key) => {
  const descriptions = {
    freeUsageLimit: 'Maximum free usage allowed',
    supportEmail: 'Support contact email',
    privacyPage: 'Privacy policy page URL',
    minimumVersion: 'Minimum required version of the app',
    latestVersion: 'Latest version of the app',
    compressionQuality: 'Image compression quality',
    btnText: 'Button text for call to action',
  }
  return descriptions[key] || 'Configuration parameter'
}
</script>
