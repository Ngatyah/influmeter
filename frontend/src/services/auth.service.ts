import { log } from 'console'
import { apiClient, AuthResponse, handleApiError } from '../lib/api'

export interface LoginData {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  role: 'influencer' | 'brand'
}

class AuthService {
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', data)
      
      // Store tokens
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token)
      }
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token)
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }

      console.log('Login successful:', response.data)
      
      return response.data
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/signup', data)
      
      // Store tokens
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token)
      }
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token)
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user))
      }
      
      return response.data
    } catch (error) {
      console.error('Signup error:', error)
      throw error
    }
  }

  async logout() {
    try {
      await apiClient.post('/auth/logout')
    } catch (error) {
      console.warn('Backend not available for logout, clearing local storage only')
    } finally {
      // Clear local storage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
  }

  getToken(): string | null {
    return localStorage.getItem('access_token')
  }
}

export const authService = new AuthService()
