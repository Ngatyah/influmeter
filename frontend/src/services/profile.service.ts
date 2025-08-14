import { apiClient, handleApiError } from '../lib/api'
import { portfolioManagementService, PortfolioItem as RealPortfolioItem } from './portfolio.service'
import { packagesManagementService, InfluencerPackage as RealInfluencerPackage } from './packages.service'

// Profile Types matching backend response
export interface SocialMediaAccount {
  handle: string
  followers: number
  posts: number
  engagement: number
}

export interface InfluencerMetrics {
  totalReach: number
  avgEngagement: number
  totalCampaigns: number
  completionRate: number
  responseTime: string
  trustScore: number
}

export interface InfluencerPackage {
  id: number
  platform: string
  type: string
  price: number
  deliverables: string[]
}

export interface PortfolioItem {
  id: string
  title: string
  brand: string
  platform: string
  type: string
  thumbnail: string
  metrics: {
    views: number
    likes: number
    engagement: number
  }
  date: string
}

export interface InfluencerReview {
  id: number
  brand: string
  rating: number
  comment: string
  campaign: string
  date: string
}

export interface InfluencerProfile {
  id: string
  name: string
  username: string
  avatar: string
  coverImage: string
  bio: string
  location: string
  verified: boolean
  joinedDate: string
  category: string
  languages: string[]
  
  socialMedia: {
    [platform: string]: SocialMediaAccount
  }
  
  metrics: InfluencerMetrics
  packages: InfluencerPackage[]
  portfolio: PortfolioItem[]
  reviews: InfluencerReview[]
}

class ProfileService {
  async getInfluencerProfile(id: string): Promise<InfluencerProfile> {
    try {
      const response = await apiClient.get(`/users/${id}/influencer-profile`)
      const baseProfile = response.data

      // Fetch real portfolio and packages data using public endpoints
      try {
        const [realPortfolio, realPackages] = await Promise.all([
          apiClient.get(`/portfolio/public/${id}`).then(res => res.data).catch(() => []),
          apiClient.get(`/packages/public/${id}`).then(res => res.data).catch(() => [])
        ])

        // Transform real portfolio data to match public profile format
        const transformedPortfolio = realPortfolio.map(item => ({
          id: item.id,
          title: item.title,
          brand: item.brandName,
          platform: item.platform,
          type: item.contentType,
          thumbnail: item.brandLogo || '/api/placeholder/400/300',
          metrics: {
            views: item.totalPerformance.views,
            likes: item.totalPerformance.likes,
            engagement: item.totalPerformance.avgEngagementRate
          },
          date: item.completedAt || item.submittedAt
        }))

        // Transform real packages data to match public profile format
        const transformedPackages = realPackages.map(pkg => ({
          id: parseInt(pkg.id!) || Math.random(),
          platform: pkg.platform,
          type: pkg.packageType,
          price: pkg.price,
          deliverables: pkg.deliverables
        }))

        return {
          ...baseProfile,
          portfolio: transformedPortfolio,
          packages: transformedPackages
        }
      } catch (portfolioError) {
        console.warn('Failed to load real portfolio/packages data, using mock data:', portfolioError)
        return baseProfile
      }
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Helper method to format numbers like 1.2M, 500K
  formatNumber(num: number): string {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  // Helper method to format currency
  formatCurrency(amount: number): string {
    return `$${amount}`
  }

  // Helper method to check if profile exists and is public
  async checkProfileExists(id: string): Promise<boolean> {
    try {
      await this.getInfluencerProfile(id)
      return true
    } catch (error) {
      return false
    }
  }
}

export const profileService = new ProfileService()