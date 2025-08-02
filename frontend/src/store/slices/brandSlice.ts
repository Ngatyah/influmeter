import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface Brand {
  id: string
  name: string
  email: string
  logo?: string
  industry: string
  description: string
  website?: string
  isVerified: boolean
}

interface BrandState {
  brands: Brand[]
  selectedBrand: Brand | null
  isLoading: boolean
  error: string | null
}

const initialState: BrandState = {
  brands: [],
  selectedBrand: null,
  isLoading: false,
  error: null,
}

export const fetchBrands = createAsyncThunk(
  'brands/fetchBrands',
  async () => {
    const response = await fetch('/api/brands')
    return response.json()
  }
)

const brandSlice = createSlice({
  name: 'brands',
  initialState,
  reducers: {
    setSelectedBrand: (state, action: PayloadAction<Brand>) => {
      state.selectedBrand = action.payload
    },
    clearSelectedBrand: (state) => {
      state.selectedBrand = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.isLoading = false
        state.brands = action.payload.brands
        state.error = null
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch brands'
      })
  },
})

export const { setSelectedBrand, clearSelectedBrand, clearError } = brandSlice.actions
export default brandSlice.reducer
