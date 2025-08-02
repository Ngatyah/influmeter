import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

// Import slices
import authSlice from './slices/authSlice'
import campaignSlice from './slices/campaignSlice'
import influencerSlice from './slices/influencerSlice'
import brandSlice from './slices/brandSlice'
import notificationSlice from './slices/notificationSlice'
import themeSlice from './slices/themeSlice'

const persistConfig = {
  key: 'influmeter',
  storage,
  whitelist: ['auth', 'theme'], // Only persist auth and theme
}

const rootReducer = combineReducers({
  auth: authSlice,
  campaigns: campaignSlice,
  influencers: influencerSlice,
  brands: brandSlice,
  notifications: notificationSlice,
  theme: themeSlice,
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/PURGE', 'persist/REGISTER'],
      },
    }),
  devTools: true, // Always enable in development
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
