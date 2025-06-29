import axios from 'axios'

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL
    this.retryCount = 3
    this.retryDelay = 1000

    // Create axios instance with default config
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => this.handleError(error),
    )
  }

  async handleError(error) {
    const { config, response } = error

    // Don't retry if it's a 4xx error (client error)
    if (response?.status >= 400 && response?.status < 500) {
      throw error
    }

    // Retry logic for 5xx errors and network errors
    if (!config.__retryCount) {
      config.__retryCount = 0
    }

    if (config.__retryCount < this.retryCount) {
      config.__retryCount++

      // Exponential backoff
      const delay = this.retryDelay * Math.pow(2, config.__retryCount - 1)
      await new Promise((resolve) => setTimeout(resolve, delay))

      return this.client(config)
    }

    throw error
  }

  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.client.defaults.headers.common['Authorization']
    }
  }

  async get(url, config = {}) {
    const response = await this.client.get(url, config)
    return response.data
  }

  async post(url, data, config = {}) {
    const response = await this.client.post(url, data, config)
    return response.data
  }

  async put(url, data, config = {}) {
    const response = await this.client.put(url, data, config)
    return response.data
  }

  async delete(url, config = {}) {
    const response = await this.client.delete(url, config)
    return response.data
  }
}

export default new ApiService()
