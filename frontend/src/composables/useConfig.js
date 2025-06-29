import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ApiService from '@/services/ApiService'

export function useConfig() {
  const authStore = useAuthStore()
  const config = ref({})
  const loading = ref(false)
  const error = ref(null)

  const userToken = computed(() => authStore.user?.token)

  watch(
    userToken,
    (newToken) => {
      if (newToken) {
        ApiService.setAuthToken(newToken)
      }
    },
    { immediate: true },
  )

  const handleApiError = (err) => {
    const errorMessage = err.response?.data?.error || 'Operation failed'
    error.value = errorMessage

    // handle 401 errors by logging out user automatically
    if (err.response?.status === 401) {
      authStore.logout()
    }

    return errorMessage
  }

  const fetchConfig = async () => {
    // prevent multiple concurrent api calls
    if (loading.value) return // Prevent concurrent requests

    loading.value = true
    error.value = null

    try {
      const data = await ApiService.get('/config/admin')
      config.value = data
      return data
    } catch (err) {
      handleApiError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateConfig = async (configData) => {
    if (loading.value) return // Prevent concurrent updates

    loading.value = true
    error.value = null

    try {
      const data = await ApiService.put('/config/admin', configData)
      config.value = data
      return data
    } catch (err) {
      handleApiError(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    config,
    loading,
    error,
    fetchConfig,
    updateConfig,
  }
}
