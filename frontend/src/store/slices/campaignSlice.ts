import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface Campaign {
  id: string
  title: string
  description: string
  budget: number
  status: 'draft' | 'active' | 'completed' | 'paused'
  startDate: string
  endDate: string
  targetAudience: string[]
  requirements: string
  brandId: string
  participantCount: number
}

interface CampaignState {
  campaigns: Campaign[]
  activeCampaigns: Campaign[]
  selectedCampaign: Campaign | null
  isLoading: boolean
  error: string | null
}

const initialState: CampaignState = {
  campaigns: [],
  activeCampaigns: [],
  selectedCampaign: null,
  isLoading: false,
  error: null,
}

export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async (params: { role: string; userId: string }) => {
    const response = await fetch(`/api/campaigns?role=${params.role}&userId=${params.userId}`)
    return response.json()
  }
)

export const createCampaign = createAsyncThunk(
  'campaigns/create',
  async (campaignData: Partial<Campaign>) => {
    const response = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaignData),
    })
    return response.json()
  }
)

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    setSelectedCampaign: (state, action: PayloadAction<Campaign>) => {
      state.selectedCampaign = action.payload
      state.error = null
    },
    clearSelectedCampaign: (state) => {
      state.selectedCampaign = null
    },
    clearError: (state) => {
      state.error = null
    },
    updateCampaignStatus: (state, action: PayloadAction<{ id: string; status: Campaign['status'] }>) => {
      const campaign = state.campaigns.find(c => c.id === action.payload.id)
      if (campaign) {
        campaign.status = action.payload.status
        // Update activeCampaigns array
        if (action.payload.status === 'active') {
          const isAlreadyActive = state.activeCampaigns.find(c => c.id === action.payload.id)
          if (!isAlreadyActive) {
            state.activeCampaigns.push(campaign)
          }
        } else {
          state.activeCampaigns = state.activeCampaigns.filter(c => c.id !== action.payload.id)
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.isLoading = false
        state.campaigns = action.payload.campaigns
        state.activeCampaigns = action.payload.campaigns.filter((c: Campaign) => c.status === 'active')
        state.error = null
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch campaigns'
      })
      .addCase(createCampaign.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.campaigns.push(action.payload)
        if (action.payload.status === 'active') {
          state.activeCampaigns.push(action.payload)
        }
        state.isLoading = false
        state.error = null
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to create campaign'
      })
  },
})

export const { setSelectedCampaign, clearSelectedCampaign, clearError, updateCampaignStatus } = campaignSlice.actions
export default campaignSlice.reducer
