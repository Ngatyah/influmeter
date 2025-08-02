import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  name: string
  email: string
  role: 'brand' | 'influencer'
  avatar?: string | null
  verified?: boolean
  onboardingCompleted?: boolean
  // Add other user properties as needed
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Mock successful login for demonstration
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string; role: string }) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock successful response based on role
    return {
      user: {
        id: '1',
        email: credentials.email,
        role: credentials.role as 'influencer' | 'brand',
        name: credentials.role === 'influencer' ? 'Murugi Munyi' : 'NIVEA Kenya',
        isVerified: true,
        avatar: '/api/placeholder/80/80',
      },
      token: 'mock-jwt-token',
    }
  }
)

// Mock successful signup
export const signupUser = createAsyncThunk(
  'auth/signup',
  async (userData: { email: string; password: string; role: string; name: string }) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return {
      user: {
        id: '2',
        email: userData.email,
        role: userData.role as 'influencer' | 'brand',
        name: userData.name,
        isVerified: false,
        avatar: '/api/placeholder/80/80',
      },
      token: 'mock-jwt-token',
    }
  }
)

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
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
      }
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
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
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Login failed'
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
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Signup failed'
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
  },
})

export const { clearError, updateUser, updateUserProfile } = authSlice.actions
export default authSlice.reducer
