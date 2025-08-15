import { apiClient, handleApiError } from '../lib/api'

// Types matching the frontend interface
export interface Influencer {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  followers: string
  engagement: string
  location: string
  niches: string[]
  platforms: { platform: string; followers: string }[]
  avgViews: string
  isVerified: boolean
  isShortlisted: boolean
  rating: number
  priceRange: string
}

export interface DiscoveryFilters {
  search?: string
  minFollowers?: string
  maxFollowers?: string
  locations?: string[]
  niches?: string[]
  platforms?: string[]
  engagementMin?: string
  verified?: boolean
  page?: number
  limit?: number
}

export interface DiscoveryResponse {
  influencers: Influencer[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

class DiscoveryService {
  async discoverInfluencers(filters?: DiscoveryFilters): Promise<DiscoveryResponse> {
    try {
      const params = new URLSearchParams()
      
      if (filters) {
        if (filters.search) params.append('search', filters.search)
        if (filters.minFollowers) params.append('minFollowers', this.parseFollowerCount(filters.minFollowers).toString())
        if (filters.maxFollowers) params.append('maxFollowers', this.parseFollowerCount(filters.maxFollowers).toString())
        if (filters.locations?.length) params.append('locations', filters.locations.join(','))
        if (filters.niches?.length) params.append('niches', filters.niches.join(','))
        if (filters.platforms?.length) params.append('platforms', filters.platforms.join(','))
        if (filters.engagementMin) params.append('engagementMin', filters.engagementMin)
        if (filters.verified) params.append('verified', filters.verified.toString())
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())
      }

      const response = await apiClient.get(`/discover/influencers${params.toString() ? '?' + params.toString() : ''}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Helper method to convert follower count strings (like "10K", "1M") to numbers
  private parseFollowerCount(count: string): number {
    if (!count) return 0
    
    const num = parseFloat(count)
    const multiplier = count.toLowerCase().slice(-1)
    
    switch (multiplier) {
      case 'k':
        return num * 1000
      case 'm':
        return num * 1000000
      case 'b':
        return num * 1000000000
      default:
        return parseInt(count) || 0
    }
  }

  // Shortlist functionality
  async toggleShortlist(influencerId: string, isShortlisted: boolean): Promise<void> {
    try {
      const method = isShortlisted ? 'DELETE' : 'POST'
      await apiClient.request({
        method,
        url: `/discover/shortlists/influencers/${influencerId}`
      })
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  async getShortlist(): Promise<Influencer[]> {
    try {
      const response = await apiClient.get('/discover/shortlists')
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }
}

export const discoveryService = new DiscoveryService()