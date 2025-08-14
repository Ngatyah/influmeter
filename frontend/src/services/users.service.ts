import { apiClient, handleApiError } from '../lib/api'

// User Types
export interface User {
  id: string
  email: string
  role: 'BRAND' | 'INFLUENCER'
  isActive: boolean
  profile?: UserProfile
  influencerProfile?: InfluencerProfile
  brandProfile?: BrandProfile
  socialAccounts?: SocialAccount[]
}

export interface UserProfile {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  bio?: string
  avatar?: string
  dateOfBirth?: string
  location?: string
}

export interface InfluencerProfile {
  niche?: string[]
  followers?: number
  averageEngagement?: number
  contentTypes?: string[]
  platforms?: string[]
  priceRange?: {
    min: number
    max: number
  }
  portfolioLinks?: string[]
  achievements?: string[]
}

export interface BrandProfile {
  companyName?: string
  industry?: string[]
  website?: string
  logoUrl?: string
  description?: string
  targetAudience?: string
  brandValues?: string[]
  marketingGoals?: string[]
}

export interface SocialAccount {
  id: string
  platform: string
  username?: string
  followerCount?: number
  isVerified: boolean
  profileUrl?: string
  lastSyncAt?: string
}

class UsersService {
  // Get user by ID (public profile view)
  async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get(`/users/${id}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get current user profile
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get('/users/profile')
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Update user profile
  async updateProfile(data: Partial<UserProfile>): Promise<User> {
    try {
      const response = await apiClient.put('/users/profile', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Update brand profile
  async updateBrandProfile(data: Partial<BrandProfile>): Promise<User> {
    try {
      const response = await apiClient.put('/users/brand-profile', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Upload brand logo
  async uploadLogo(file: File): Promise<{ message: string, logoUrl: string, user: User }> {
    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await apiClient.post('/users/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get user's social accounts
  async getSocialAccounts(): Promise<SocialAccount[]> {
    try {
      const response = await apiClient.get('/users/social-accounts')
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Helper: Format follower count
  formatFollowerCount(count?: number): string {
    if (!count || count === 0) return '0'
    if (count < 1000) return count.toString()
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K`
    return `${(count / 1000000).toFixed(1)}M`
  }

  // Helper: Get display name
  getDisplayName(user: User): string {
    if (user.profile?.firstName && user.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`
    }
    if (user.profile?.firstName) {
      return user.profile.firstName
    }
    if (user.brandProfile?.companyName) {
      return user.brandProfile.companyName
    }
    return 'User'
  }

  // Helper: Get avatar or default
  getAvatarUrl(user: User): string {
    return user.profile?.avatar || '/api/placeholder/100/100'
  }
}

export const usersService = new UsersService()