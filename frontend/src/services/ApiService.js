import axios from 'axios'

class ApiService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 5000,
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add request timestamp for monitoring
        config.metadata = { startTime: Date.now() }
        return config
      },
      (error) => Promise.reject(error),
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response time in development
        if (import.meta.env.DEV) {
          const duration = Date.now() - response.config.metadata.startTime
          console.log(
            `API ${response.config.method?.toUpperCase()} ${response.config.url}: ${duration}ms`,
          )
        }
        return response
      },
      (error) => this.handleError(error),
    )
  }

  async handleError(error) {
    const { config, response } = error

    // Don't retry client errors (4xx)
    if (response?.status >= 400 && response?.status < 500) {
      return Promise.reject(error)
    }

    // Retry logic for server errors and network issues
    const retryCount = config.__retryCount || 0

    if (retryCount < this.retryConfig.maxRetries) {
      config.__retryCount = retryCount + 1

      // Exponential backoff with jitter
      const delay = Math.min(
        this.retryConfig.baseDelay * Math.pow(2, retryCount) + Math.random() * 1000,
        this.retryConfig.maxDelay,
      )

      await this.delay(delay)
      return this.client(config)
    }

    return Promise.reject(error)
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  setAuthToken(token) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.client.defaults.headers.common['Authorization']
    }
  }

  async request(method, url, data = null, config = {}) {
    const requestConfig = {
      method,
      url,
      ...config,
    }

    if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
      requestConfig.data = data
    } else if (data && method.toLowerCase() === 'get') {
      requestConfig.params = data
    }

    const response = await this.client(requestConfig)
    return response.data
  }

  async get(url, params = null, config = {}) {
    return this.request('GET', url, params, config)
  }

  async post(url, data, config = {}) {
    return this.request('POST', url, data, config)
  }

  async put(url, data, config = {}) {
    return this.request('PUT', url, data, config)
  }

  async delete(url, config = {}) {
    return this.request('DELETE', url, null, config)
  }
}

export default new ApiService()
