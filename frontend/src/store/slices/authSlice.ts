import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authService } from '../../services/auth.service'

export interface User {
  id: string
  email: string
  role: 'BRAND' | 'INFLUENCER'
  emailVerified: boolean
  status: string
  createdAt: string
  updatedAt: string
  profile?: any | null
  onboardingProgress?: any | null
  // Backward compatibility
  name?: string
  avatar?: string | null
  verified?: boolean
  onboardingCompleted?: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Initialize state from localStorage
const getInitialState = (): AuthState => {
  const token = localStorage.getItem('access_token')
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  
  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading: false,
    error: null,
  }
}

const initialState: AuthState = getInitialState()

// Real login using auth service
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string; role: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login({
        email: credentials.email,
        password: credentials.password,
      })
      
      return {
        user: response.user,
        token: response.access_token,
        redirectTo: response.redirectTo,
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed'
      return rejectWithValue(message)
    }
  }
)

// Real signup using auth service
export const signupUser = createAsyncThunk(
  'auth/signup',
  async (userData: { email: string; password: string; role: string }, { rejectWithValue }) => {
    try {
      const response = await authService.signup({
        email: userData.email,
        password: userData.password,
        role: userData.role as 'influencer' | 'brand',
      })
      
      return {
        user: response.user,
        token: response.access_token,
        redirectTo: response.redirectTo,
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Signup failed'
      return rejectWithValue(message)
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authService.logout()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        // Update localStorage as well
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        // Update localStorage as well
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },
    // Add action to clear auth state on error
    clearAuth: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        
        // Store token in localStorage for API client
        if (action.payload.token) {
          localStorage.setItem('access_token', action.payload.token)
        }
        if (action.payload.user) {
          localStorage.setItem('user', JSON.stringify(action.payload.user))
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string || action.error.message || 'Login failed'
      })
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        
        // Store token in localStorage for API client
        if (action.payload.token) {
          localStorage.setItem('access_token', action.payload.token)
        }
        if (action.payload.user) {
          localStorage.setItem('user', JSON.stringify(action.payload.user))
        }
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string || action.error.message || 'Signup failed'
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        
        // Clear localStorage
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user')
      })
  },
})

export const { clearError, updateUser, updateUserProfile, clearAuth } = authSlice.actions
export default authSlice.reducer
