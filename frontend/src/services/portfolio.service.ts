import { apiClient, handleApiError } from '../lib/api'
import { contentService, ContentSubmission } from './content.service'

// Updated Portfolio Item structure based on real campaign data
export interface PortfolioItem {
  id: string
  campaignId: string
  contentId: string
  title: string // Campaign title
  brandName: string
  brandLogo?: string
  contentTitle?: string
  description?: string
  platform: string
  contentType: string
  status: 'COMPLETED' | 'PAID'
  amount?: number
  
  // Real data from content submissions
  submittedAt: string
  completedAt?: string
  paidAt?: string
  
  // Published post data (real URLs)
  publishedPosts: {
    platform: string
    postUrl: string
    postType: string
    publishedAt: string
    status: 'VERIFIED' | 'PENDING_VERIFICATION' | 'INVALID_URL'
    // Mock performance data (until OAuth)
    performance?: {
      views: number
      likes: number
      comments: number
      shares: number
      saves: number
      impressions: number
      reach: number
      engagementRate: number
      ctr?: number
      lastUpdated: string
    }
  }[]
  
  // Aggregated performance across all posts
  totalPerformance: {
    views: number
    likes: number
    comments: number
    shares: number
    saves: number
    impressions: number
    reach: number
    avgEngagementRate: number
  }
}

// Legacy interface for backward compatibility (will be removed)
export interface CreatePortfolioItemData {
  title: string
  description?: string
  brandName: string
  platform: string
  contentType: string
  thumbnailUrl?: string
  postUrl?: string
  views?: number
  likes?: number
  shares?: number
  comments?: number
  engagement?: number
  publishedAt?: string
}

class PortfolioManagementService {
  // Get portfolio from completed campaigns with content submissions
  async getMyPortfolio(): Promise<PortfolioItem[]> {
    try {
      // Use existing content service to get all submissions, then filter for COMPLETED/PAID
      const response = await contentService.getMyContentSubmissions()
      
      // Filter for completed/paid content and process
      const completedContent = response.contentSubmissions.filter(
        content => content.status === 'COMPLETED' || content.status === 'PAID'
      )
      
      return this.processPortfolioData(completedContent)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Process and format campaign-based portfolio data
  private processPortfolioData(contentSubmissions: ContentSubmission[]): PortfolioItem[] {
    return contentSubmissions.map(content => {
      // Generate mock performance data for published posts (if they exist)
      const publishedPosts = (content.publishedPosts || []).map(post => ({
        platform: post.platform,
        postUrl: post.postUrl,
        postType: post.postType || 'POST',
        publishedAt: post.publishedAt,
        status: post.status || 'VERIFIED',
        performance: post.performance || this.generateMockPerformance(post.platform, content.contentType)
      }))

      // If no published posts, create mock ones based on platforms
      const finalPublishedPosts = publishedPosts.length > 0 ? publishedPosts : 
        (content.platforms || ['Instagram']).map(platform => ({
          platform: platform,
          postUrl: `https://${platform.toLowerCase()}.com/mock-post/${content.id}`, // Mock URL
          postType: content.contentType || 'POST',
          publishedAt: content.completedAt || content.submittedAt,
          status: 'VERIFIED' as const,
          performance: this.generateMockPerformance(platform, content.contentType)
        }))

      // Aggregate total performance across all posts
      const totalPerformance = this.aggregatePerformance(finalPublishedPosts)

      return {
        id: content.id,
        campaignId: content.campaignId,
        contentId: content.id,
        title: content.campaign.title,
        brandName: content.campaign.brand?.brandProfile?.companyName || 
                  `${content.campaign.brand?.profile?.firstName || ''} ${content.campaign.brand?.profile?.lastName || ''}`.trim() ||
                  'Brand Name', // Fallback
        brandLogo: content.campaign.brand?.brandProfile?.logoUrl,
        contentTitle: content.title,
        description: content.description,
        platform: (content.platforms && content.platforms[0]) || 'Instagram', // Primary platform
        contentType: content.contentType,
        status: content.status as 'COMPLETED' | 'PAID',
        amount: content.amount,
        submittedAt: content.submittedAt,
        completedAt: content.completedAt,
        paidAt: content.paidAt,
        publishedPosts: finalPublishedPosts,
        totalPerformance
      }
    })
  }

  // Generate mock performance data until OAuth integration
  private generateMockPerformance(platform: string, contentType: string) {
    // Base ranges vary by platform and content type
    const platformMultipliers = {
      instagram: { views: 1.5, engagement: 1.2 },
      tiktok: { views: 3.0, engagement: 2.0 },
      youtube: { views: 5.0, engagement: 0.8 },
      twitter: { views: 0.8, engagement: 0.6 },
      facebook: { views: 1.0, engagement: 0.4 },
      linkedin: { views: 0.5, engagement: 0.8 }
    }

    const contentTypeMultipliers = {
      REEL: { views: 2.0, engagement: 1.5 },
      VIDEO: { views: 3.0, engagement: 1.3 },
      STORY: { views: 0.7, engagement: 1.8 },
      POST: { views: 1.0, engagement: 1.0 }
    }

    const platformMult = platformMultipliers[platform?.toLowerCase()] || { views: 1.0, engagement: 1.0 }
    const contentMult = contentTypeMultipliers[contentType] || { views: 1.0, engagement: 1.0 }

    // Base metrics (will be randomized)
    const baseViews = Math.floor((Math.random() * 25000 + 5000) * platformMult.views * contentMult.views)
    const baseLikes = Math.floor(baseViews * 0.08 * platformMult.engagement * contentMult.engagement)
    const baseComments = Math.floor(baseLikes * 0.12)
    const baseShares = Math.floor(baseLikes * 0.05)
    const baseSaves = Math.floor(baseLikes * 0.15)
    const impressions = Math.floor(baseViews * 1.8)
    const reach = Math.floor(baseViews * 0.85)
    
    return {
      views: baseViews,
      likes: baseLikes,
      comments: baseComments,
      shares: baseShares,
      saves: baseSaves,
      impressions,
      reach,
      engagementRate: +((baseLikes + baseComments + baseShares) / baseViews * 100).toFixed(2),
      ctr: +(Math.random() * 2.5 + 0.5).toFixed(2),
      lastUpdated: new Date().toISOString()
    }
  }

  // Aggregate performance across all published posts
  private aggregatePerformance(publishedPosts: any[]) {
    const totals = publishedPosts.reduce(
      (acc, post) => {
        const perf = post.performance || {}
        return {
          views: acc.views + (perf.views || 0),
          likes: acc.likes + (perf.likes || 0),
          comments: acc.comments + (perf.comments || 0),
          shares: acc.shares + (perf.shares || 0),
          saves: acc.saves + (perf.saves || 0),
          impressions: acc.impressions + (perf.impressions || 0),
          reach: acc.reach + (perf.reach || 0),
          engagementRates: [...acc.engagementRates, perf.engagementRate || 0]
        }
      },
      {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        saves: 0,
        impressions: 0,
        reach: 0,
        engagementRates: [] as number[]
      }
    )

    return {
      ...totals,
      avgEngagementRate: totals.engagementRates.length > 0
        ? +(totals.engagementRates.reduce((a, b) => a + b, 0) / totals.engagementRates.length).toFixed(2)
        : 0
    }
  }

  // Legacy methods for backward compatibility (will be removed)
  async createPortfolioItem(data: CreatePortfolioItemData): Promise<PortfolioItem> {
    throw new Error('Manual portfolio creation is deprecated. Portfolio is now auto-generated from completed campaigns.')
  }

  async updatePortfolioItem(id: string, data: Partial<CreatePortfolioItemData>): Promise<PortfolioItem> {
    throw new Error('Portfolio items cannot be manually updated. They are auto-generated from campaign performance.')
  }

  async deletePortfolioItem(id: string): Promise<void> {
    throw new Error('Portfolio items cannot be manually deleted. They reflect actual campaign work.')
  }

  // Helper method to format numbers for display
  formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  // Helper method to get platform icon/color
  getPlatformInfo(platform: string) {
    const platformInfo = {
      instagram: { color: 'text-pink-600', bgColor: 'bg-pink-100', icon: '📸' },
      tiktok: { color: 'text-black', bgColor: 'bg-gray-100', icon: '🎵' },
      youtube: { color: 'text-red-600', bgColor: 'bg-red-100', icon: '📺' },
      twitter: { color: 'text-blue-500', bgColor: 'bg-blue-100', icon: '🐦' },
      facebook: { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: '📘' },
      linkedin: { color: 'text-blue-800', bgColor: 'bg-blue-100', icon: '💼' }
    }
    return platformInfo[platform?.toLowerCase()] || { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '🔗' }
  }
}

export const portfolioManagementService = new PortfolioManagementService()