import axios from 'axios'

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
const SERVER_BASE_URL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001'

console.log('🔗 API Base URL:', API_BASE_URL) // Debug log

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status) // Debug log
    return response
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.status, error.response?.data) // Debug log
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API Response Types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    role: string
    profile?: any
    onboardingProgress?: any
  }
  access_token: string
  refresh_token: string
  redirectTo: string
}

// Generic API error handler
export const handleApiError = (error: any) => {
  if (error.response?.data?.message) {
    return error.response.data.message
  }
  return error.message || 'An unexpected error occurred'
}

// Utility function to convert relative paths to full URLs
export const getFullUrl = (path: string | null | undefined): string => {
  if (!path) return '/api/placeholder/80/80'
  
  // If it's already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  // If it's a relative path starting with /, prepend the server base URL
  if (path.startsWith('/')) {
    return `${SERVER_BASE_URL}${path}`
  }
  
  // If it's a placeholder or other path, return as is
  return path
}
