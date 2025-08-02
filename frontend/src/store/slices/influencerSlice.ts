import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface Influencer {
  id: string
  name: string
  email: string
  avatar?: string
  bio: string
  followerCount: number
  engagementRate: number
  niche: string[]
  socialAccounts: {
    platform: string
    username: string
    followerCount: number
  }[]
  location: string
  isVerified: boolean
}

interface InfluencerState {
  influencers: Influencer[]
  selectedInfluencer: Influencer | null
  isLoading: boolean
  error: string | null
}

const initialState: InfluencerState = {
  influencers: [],
  selectedInfluencer: null,
  isLoading: false,
  error: null,
}

export const fetchInfluencers = createAsyncThunk(
  'influencers/fetchInfluencers',
  async (filters?: { niche?: string; location?: string; minFollowers?: number }) => {
    const queryParams = new URLSearchParams(filters as Record<string, string>).toString()
    const response = await fetch(`/api/influencers?${queryParams}`)
    return response.json()
  }
)

const influencerSlice = createSlice({
  name: 'influencers',
  initialState,
  reducers: {
    setSelectedInfluencer: (state, action: PayloadAction<Influencer>) => {
      state.selectedInfluencer = action.payload
    },
    clearSelectedInfluencer: (state) => {
      state.selectedInfluencer = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInfluencers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchInfluencers.fulfilled, (state, action) => {
        state.isLoading = false
        state.influencers = action.payload.influencers
        state.error = null
      })
      .addCase(fetchInfluencers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch influencers'
      })
  },
})

export const { setSelectedInfluencer, clearSelectedInfluencer, clearError } = influencerSlice.actions
export default influencerSlice.reducer
