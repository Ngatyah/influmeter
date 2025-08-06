import { apiClient, handleApiError } from '../lib/api'

// Influencer Onboarding Types
export interface InfluencerPersonalData {
  firstName: string
  lastName: string
  bio: string
  location: string
  phone: string
}

export interface InfluencerCategoriesData {
  categories: string[]
  niches: string[]
  languages: string[]
}

export interface SocialAccountData {
  platform: string
  username: string
  followers?: string
}

export interface InfluencerSocialData {
  accounts: SocialAccountData[]
}

export interface InfluencerRatesData {
  contentTypes: string[]
  rates: Record<string, number>
}

// Brand Onboarding Types
export interface BrandCompanyData {
  companyName: string
  industry: string
  companySize: string
  description: string
  contactName: string
  logoUrl?: string
}

export interface BrandGoalsData {
  objectives: string[]
  campaignTypes: string[]
  targetAudience: Record<string, any>
}

export interface BrandPreferencesData {
  budgetRange: string
  platforms: string[]
  influencerTypes: string[]
  collaborationStyle: string
}

class OnboardingService {
  // Get onboarding progress
  async getProgress() {
    try {
      const response = await apiClient.get('/onboarding/progress')
      return response.data
    } catch (error) {
      console.warn('Backend not available, using mock onboarding progress')
      return { currentStep: 1, completed: false, steps: [] }
    }
  }

  // Influencer onboarding methods
  async saveInfluencerPersonal(data: InfluencerPersonalData) {
    try {
      const response = await apiClient.post('/onboarding/influencer/personal', data)
      return response.data
    } catch (error) {
      console.error('Failed to save personal information:', error)
      throw new Error(handleApiError(error))
    }
  }

  async saveInfluencerCategories(data: InfluencerCategoriesData) {
    try {
      const response = await apiClient.post('/onboarding/influencer/categories', data)
      return response.data
    } catch (error) {
      console.error('Failed to save categories:', error)
      throw new Error(handleApiError(error))
    }
  }

  async saveInfluencerSocial(data: InfluencerSocialData) {
    try {
      const response = await apiClient.post('/onboarding/influencer/social', data)
      return response.data
    } catch (error) {
      console.error('Failed to save social accounts:', error)
      throw new Error(handleApiError(error))
    }
  }

  async saveInfluencerRates(data: InfluencerRatesData) {
    try {
      const response = await apiClient.post('/onboarding/influencer/rates', data)
      return response.data
    } catch (error) {
      console.error('Failed to save rates:', error)
      throw new Error(handleApiError(error))
    }
  }

  // Brand onboarding methods
  async saveBrandCompany(data: BrandCompanyData) {
    try {
      const response = await apiClient.post('/onboarding/brand/company', data)
      return response.data
    } catch (error) {
      console.error('Failed to save company information:', error)
      throw new Error(handleApiError(error))
    }
  }

  async saveBrandGoals(data: BrandGoalsData) {
    try {
      const response = await apiClient.post('/onboarding/brand/goals', data)
      return response.data
    } catch (error) {
      console.error('Failed to save marketing goals:', error)
      throw new Error(handleApiError(error))
    }
  }

  async saveBrandPreferences(data: BrandPreferencesData) {
    try {
      const response = await apiClient.post('/onboarding/brand/preferences', data)
      return response.data
    } catch (error) {
      console.error('Failed to save brand preferences:', error)
      throw new Error(handleApiError(error))
    }
  }

  // Skip step
  async skipStep(step: number) {
    try {
      const response = await apiClient.put(`/onboarding/skip/${step}`)
      return response.data
    } catch (error) {
      console.error('Failed to skip step:', error)
      throw new Error(handleApiError(error))
    }
  }
}

export const onboardingService = new OnboardingService()
