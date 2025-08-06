import { apiClient, handleApiError } from '../lib/api'

// Dashboard Data Types
export interface BrandDashboardData {
  campaigns: {
    total: number
    active: number
    completed: number
    draft: number
  }
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
    growth: number
  }
  influencers: {
    total: number
    active: number
    pending: number
  }
  performance: {
    reach: string
    engagement: string
    impressions: string
    clicks: string
  }
  recentCampaigns: Array<{
    id: string
    title: string
    status: string
    budget: number
    influencers: number
    performance: {
      reach: string
      engagement: string
    }
    createdAt: string
  }>
  topInfluencers: Array<{
    id: string
    name: string
    username: string
    avatar: string
    followers: string
    engagement: string
    campaigns: number
    revenue: number
  }>
}

export interface InfluencerDashboardData {
  earnings: {
    total: number
    thisMonth: number
    lastMonth: number
    pending: number
    growth: number
  }
  campaigns: {
    active: number
    completed: number
    applications: number
    invitations: number
  }
  performance: {
    reach: string
    engagement: string
    avgViews: string
    totalContent: number
  }
  socialStats: {
    totalFollowers: number
    avgEngagement: string
    topPlatform: string
    growth: number
  }
  activeCampaigns: Array<{
    id: string
    title: string
    brand: string
    status: string
    deadline: string
    earning: number
    progress: number
  }>
  recentActivities: Array<{
    id: string
    type: 'content_approved' | 'payment_received' | 'campaign_invite' | 'application_accepted'
    title: string
    description: string
    amount?: number
    timestamp: string
  }>
  contentStatus: {
    submitted: number
    approved: number
    pending: number
    rejected: number
  }
}

class DashboardService {
  // Brand Dashboard
  async getBrandDashboard(): Promise<BrandDashboardData> {
    try {
      const response = await apiClient.get('/dashboard/brand/overview')
      return response.data
    } catch (error) {
      // Return mock data if backend is not available
      console.warn('Backend not available, using mock data for brand dashboard')
      return this.getMockBrandDashboard()
    }
  }

  private getMockBrandDashboard(): BrandDashboardData {
    return {
      campaigns: {
        total: 12,
        active: 5,
        completed: 6,
        draft: 1
      },
      revenue: {
        total: 45000,
        thisMonth: 12000,
        lastMonth: 8500,
        growth: 41.2
      },
      influencers: {
        total: 28,
        active: 15,
        pending: 3
      },
      performance: {
        reach: '2.1M',
        engagement: '12.3%',
        impressions: '5.2M',
        clicks: '145K'
      },
      recentCampaigns: [
        {
          id: '1',
          title: 'Summer Collection Launch',
          status: 'active',
          budget: 15000,
          influencers: 8,
          performance: {
            reach: '450K',
            engagement: '8.5%'
          },
          createdAt: '2024-07-15'
        },
        {
          id: '2',
          title: 'Brand Awareness Q3',
          status: 'completed',
          budget: 12000,
          influencers: 6,
          performance: {
            reach: '320K',
            engagement: '12.1%'
          },
          createdAt: '2024-06-20'
        }
      ],
      topInfluencers: [
        {
          id: '1',
          name: 'Murugi Munyi',
          username: '@murugi',
          avatar: '/api/placeholder/40/40',
          followers: '125K',
          engagement: '8.4%',
          campaigns: 3,
          revenue: 8500
        },
        {
          id: '2',
          name: 'Sharon Mundia',
          username: '@sharon',
          avatar: '/api/placeholder/40/40',
          followers: '95K',
          engagement: '9.2%',
          campaigns: 2,
          revenue: 6200
        }
      ]
    }
  }

  // Influencer Dashboard
  async getInfluencerDashboard(): Promise<InfluencerDashboardData> {
    try {
      const response = await apiClient.get('/dashboard/influencer/overview')
      return response.data
    } catch (error) {
      // Return mock data if backend is not available
      console.warn('Backend not available, using mock data for influencer dashboard')
      return this.getMockInfluencerDashboard()
    }
  }

  private getMockInfluencerDashboard(): InfluencerDashboardData {
    return {
      earnings: {
        total: 25000,
        thisMonth: 4500,
        lastMonth: 3200,
        pending: 1200,
        growth: 40.6
      },
      campaigns: {
        active: 3,
        completed: 12,
        applications: 2,
        invitations: 1
      },
      performance: {
        reach: '450K',
        engagement: '8.4%',
        avgViews: '12.5K',
        totalContent: 48
      },
      socialStats: {
        totalFollowers: 125000,
        avgEngagement: '8.4%',
        topPlatform: 'Instagram',
        growth: 12.3
      },
      activeCampaigns: [
        {
          id: '1',
          title: 'Summer Fashion Trends',
          brand: 'NIVEA Kenya',
          status: 'active',
          deadline: '2024-08-15',
          earning: 2500,
          progress: 65
        },
        {
          id: '2',
          title: 'Fitness Challenge',
          brand: 'SportPesa',
          status: 'pending',
          deadline: '2024-08-30',
          earning: 1800,
          progress: 25
        }
      ],
      recentActivities: [
        {
          id: '1',
          type: 'content_approved',
          title: 'Content Approved',
          description: 'Your Instagram post for Summer Campaign was approved',
          amount: 1200,
          timestamp: '2024-07-28T10:30:00Z'
        },
        {
          id: '2',
          type: 'payment_received',
          title: 'Payment Received',
          description: 'Payment of KES 2,500 has been processed',
          amount: 2500,
          timestamp: '2024-07-25T14:15:00Z'
        }
      ],
      contentStatus: {
        submitted: 5,
        approved: 12,
        pending: 3,
        rejected: 1
      }
    }
  }

  // Get influencer campaigns
  async getInfluencerCampaigns(limit: number = 10) {
    try {
      const response = await apiClient.get(`/dashboard/influencer/campaigns?limit=${limit}`)
      return response.data
    } catch (error) {
      console.warn('Backend not available, using mock data for influencer campaigns')
      return { campaigns: this.getMockInfluencerDashboard().activeCampaigns.slice(0, limit) }
    }
  }

  // Get influencer earnings
  async getInfluencerEarnings() {
    try {
      const response = await apiClient.get('/dashboard/influencer/earnings')
      return response.data
    } catch (error) {
      console.warn('Backend not available, using mock data for influencer earnings')
      return { earnings: this.getMockInfluencerDashboard().earnings }
    }
  }

  // Get recent campaigns for brand
  async getBrandCampaigns(limit: number = 5) {
    try {
      const response = await apiClient.get(`/dashboard/brand/campaigns?limit=${limit}`)
      return response.data
    } catch (error) {
      console.warn('Backend not available, using mock data for brand campaigns')
      return { campaigns: this.getMockBrandDashboard().recentCampaigns.slice(0, limit) }
    }
  }

  // Get analytics data
  async getBrandAnalytics(period: 'week' | 'month' | 'quarter' = 'month') {
    try {
      const response = await apiClient.get(`/dashboard/brand/analytics?period=${period}`)
      return response.data
    } catch (error) {
      console.warn('Backend not available, using mock data for brand analytics')
      return { 
        analytics: this.getMockBrandDashboard().performance,
        revenue: this.getMockBrandDashboard().revenue
      }
    }
  }

  async getInfluencerAnalytics(period: 'week' | 'month' | 'quarter' = 'month') {
    try {
      const response = await apiClient.get(`/dashboard/influencer/analytics?period=${period}`)
      return response.data
    } catch (error) {
      console.warn('Backend not available, using mock data for influencer analytics')
      return { 
        analytics: this.getMockInfluencerDashboard().performance,
        earnings: this.getMockInfluencerDashboard().earnings
      }
    }
  }
}

export const dashboardService = new DashboardService()
