<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
  >
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <h3 class="text-lg font-semibold text-white mb-4">
        Country-specific Values for "{{ parameterKey }}"
      </h3>

      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-300 mb-2">Default Value</label>
        <div class="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600">
          {{ defaultValue }}
        </div>
      </div>

      <!-- Country Values List -->
      <div class="mb-6">
        <h4 class="text-sm font-medium text-gray-300 mb-3">Country-specific Values</h4>
        <div class="space-y-3">
          <div
            v-for="(value, countryCode) in countryValues"
            :key="countryCode"
            class="p-3 bg-gray-700 rounded"
          >
            <!-- Mobile Layout -->
            <div class="block sm:hidden space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-mono text-gray-300 bg-gray-600 px-2 py-1 rounded">
                  {{ countryCode }}
                </span>
                <button
                  @click="removeCountry(countryCode)"
                  class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                >
                  Remove
                </button>
              </div>
              <input
                v-model="countryValues[countryCode]"
                class="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none text-sm"
              />
            </div>

            <!-- Desktop Layout -->
            <div class="hidden sm:flex items-center space-x-3">
              <div class="flex-shrink-0 w-12">
                <span class="text-sm font-mono text-gray-300">{{ countryCode }}</span>
              </div>
              <div class="flex-grow">
                <input
                  v-model="countryValues[countryCode]"
                  class="w-full px-3 py-1 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
              <button
                @click="removeCountry(countryCode)"
                class="flex-shrink-0 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Add New Country -->
      <div class="mb-6 p-4 bg-gray-700 rounded">
        <h4 class="text-sm font-medium text-gray-300 mb-3">Add Country-specific Value</h4>

        <!-- Mobile Layout -->
        <div class="block sm:hidden space-y-3">
          <select
            v-model="newCountry.code"
            class="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none text-sm"
          >
            <option value="">Select Country</option>
            <option v-for="country in availableCountries" :key="country.code" :value="country.code">
              {{ country.code }} - {{ country.name }}
            </option>
          </select>
          <input
            v-model="newCountry.value"
            placeholder="Value for this country"
            class="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none text-sm"
          />
          <button
            @click="addCountry"
            :disabled="!newCountry.code || !newCountry.value"
            class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            Add Country Value
          </button>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden sm:flex space-x-3">
          <select
            v-model="newCountry.code"
            class="px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select Country</option>
            <option v-for="country in availableCountries" :key="country.code" :value="country.code">
              {{ country.code }} - {{ country.name }}
            </option>
          </select>
          <input
            v-model="newCountry.value"
            placeholder="Value for this country"
            class="flex-grow px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
          />
          <button
            @click="addCountry"
            :disabled="!newCountry.code || !newCountry.value"
            class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      </div>

      <!-- Actions -->
      <div
        class="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-600"
      >
        <button
          @click="$emit('close')"
          class="w-full sm:w-auto px-4 py-2 text-gray-300 hover:text-white transition-colors order-2 sm:order-1"
        >
          Cancel
        </button>
        <button
          @click="save"
          class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors order-1 sm:order-2"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  parameterKey: String,
  defaultValue: [String, Number],
  countryValuesData: Object,
})

const emit = defineEmits(['close', 'save'])

const countryValues = ref({})
const newCountry = ref({
  code: '',
  value: '',
})

// Common countries list
const countries = [
  { code: 'US', name: 'United States' },
  { code: 'TR', name: 'Turkey' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'RU', name: 'Russia' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SG', name: 'Singapore' },
  { code: 'NL', name: 'Netherlands' },
]

const availableCountries = computed(() => {
  return countries.filter((country) => !countryValues.value[country.code])
})

watch(
  () => props.countryValuesData,
  (newData) => {
    countryValues.value = { ...(newData || {}) }
  },
  { immediate: true },
)

const addCountry = () => {
  if (newCountry.value.code && newCountry.value.value) {
    countryValues.value[newCountry.value.code] = newCountry.value.value
    newCountry.value = { code: '', value: '' }
  }
}

const removeCountry = (countryCode) => {
  delete countryValues.value[countryCode]
}

const save = () => {
  emit('save', { ...countryValues.value })
}
</script>
