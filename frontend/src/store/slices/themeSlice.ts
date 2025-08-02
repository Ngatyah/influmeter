import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: Theme
  systemPreference: 'light' | 'dark'
}

const initialState: ThemeState = {
  mode: 'light',
  systemPreference: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.mode = action.payload
    },
    setSystemPreference: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.systemPreference = action.payload
    },
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light'
    },
  },
})

export const { setTheme, setSystemPreference, toggleTheme } = themeSlice.actions
export default themeSlice.reducer
