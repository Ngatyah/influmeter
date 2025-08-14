import { apiClient, handleApiError } from '../lib/api'

// Campaign Types
export interface Campaign {
  id: string
  title: string
  objective: string
  description?: string
  budget?: number
  startDate?: string
  endDate?: string
  maxInfluencers?: number
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  targetCriteria?: object
  requirements?: object
  
  // Approval Settings
  requiresApproval?: boolean
  autoApproveInfluencers?: string[]
  approvalInstructions?: string
  
  createdAt: string
  updatedAt: string
  brand?: {
    id: string
    profile?: {
      firstName?: string
      lastName?: string
    }
    brandProfile?: {
      companyName?: string
      logoUrl?: string
    }
  }
  _count?: {
    participants: number
    applications: number
    contentSubmissions: number
  }
}

export interface CampaignApplication {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  applicationData?: {
    message?: string
    motivation?: string
    contentIdeas?: string
    proposedTimeline?: string
    portfolioLinks?: string[]
    agreedToTerms?: boolean
    agreedToExclusivity?: boolean
    agreedToDeadlines?: boolean
  }
  appliedAt: string
  respondedAt?: string
  campaign: Campaign
  influencer: {
    id: string
    profile?: {
      firstName?: string
      lastName?: string
      avatarUrl?: string
    }
    influencerProfile?: {
      categories?: string[]
      niches?: string[]
    }
  }
}

export interface CreateCampaignData {
  title: string
  objective: string
  description?: string
  budget?: number
  startDate?: string
  endDate?: string
  maxInfluencers?: number
  targetCriteria?: object
  requirements?: object
  status?: 'DRAFT' | 'ACTIVE'
  
  // Approval Settings
  requiresApproval?: boolean
  autoApproveInfluencers?: string[]
  approvalInstructions?: string
}

export interface CampaignFilters {
  search?: string
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  minBudget?: number
  maxBudget?: number
  page?: number
  limit?: number
}

class CampaignService {
  // Create a new campaign
  async createCampaign(campaignData: CreateCampaignData): Promise<Campaign> {
    try {
      const response = await apiClient.post('/campaigns', campaignData)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get brand's campaigns
  async getMyCampaigns(filters?: CampaignFilters): Promise<{
    campaigns: Campaign[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }> {
    try {
      const params = new URLSearchParams()
      
      if (filters) {
        if (filters.search) params.append('search', filters.search)
        if (filters.status) params.append('status', filters.status)
        if (filters.minBudget !== undefined) params.append('minBudget', filters.minBudget.toString())
        if (filters.maxBudget !== undefined) params.append('maxBudget', filters.maxBudget.toString())
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())
      }

      const response = await apiClient.get(`/campaigns/my-campaigns${params.toString() ? '?' + params.toString() : ''}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Browse campaigns (for influencers)
  async browseCampaigns(filters?: CampaignFilters): Promise<{
    campaigns: Campaign[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }> {
    try {
      const params = new URLSearchParams()
      
      if (filters) {
        if (filters.search) params.append('search', filters.search)
        if (filters.minBudget !== undefined) params.append('minBudget', filters.minBudget.toString())
        if (filters.maxBudget !== undefined) params.append('maxBudget', filters.maxBudget.toString())
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())
      }

      const response = await apiClient.get(`/campaigns/browse${params.toString() ? '?' + params.toString() : ''}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get single campaign
  async getCampaign(id: string): Promise<Campaign> {
    try {
      const response = await apiClient.get(`/campaigns/${id}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Update campaign
  async updateCampaign(id: string, campaignData: Partial<CreateCampaignData>): Promise<Campaign> {
    try {
      const response = await apiClient.put(`/campaigns/${id}`, campaignData)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Update campaign status
  async updateCampaignStatus(id: string, status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'): Promise<Campaign> {
    try {
      const response = await apiClient.put(`/campaigns/${id}/status`, { status })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Delete campaign
  async deleteCampaign(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/campaigns/${id}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Apply to campaign
  async applyToCampaign(campaignId: string, applicationData: {
    message?: string
    proposedDeliverables?: string[]
    applicationData?: object
  }): Promise<CampaignApplication> {
    try {
      const response = await apiClient.post(`/campaigns/${campaignId}/apply`, applicationData)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get campaign applications (for brands)
  async getCampaignApplications(campaignId: string): Promise<CampaignApplication[]> {
    try {
      const response = await apiClient.get(`/campaigns/${campaignId}/applications`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Update application status (for brands)
  async updateApplicationStatus(applicationId: string, status: 'ACCEPTED' | 'REJECTED', message?: string): Promise<CampaignApplication> {
    try {
      const response = await apiClient.put(`/campaigns/applications/${applicationId}/status`, {
        status,
        message
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get user's own applications (influencers)
  async getMyApplications(): Promise<CampaignApplication[]> {
    try {
      const response = await apiClient.get('/campaigns/applications/my')
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Check if user has applied to specific campaign
  async checkApplicationStatus(campaignId: string): Promise<{ hasApplied: boolean; application: any }> {
    try {
      const response = await apiClient.get(`/campaigns/${campaignId}/application-status`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Transform frontend campaign data to backend format
  transformCampaignData(frontendData: any): CreateCampaignData {
    return {
      title: frontendData.title,
      objective: frontendData.objective,
      description: frontendData.description,
      budget: frontendData.budget?.total ? parseFloat(frontendData.budget.total) : undefined,
      startDate: frontendData.timeline?.startDate || undefined,
      endDate: frontendData.timeline?.endDate || undefined,
      maxInfluencers: frontendData.influencerRequirements?.maxInfluencers ? parseInt(frontendData.influencerRequirements.maxInfluencers) : undefined,
      targetCriteria: {
        targetAudience: frontendData.targetAudience,
        influencerRequirements: frontendData.influencerRequirements
      },
      requirements: {
        contentBrief: frontendData.contentBrief
      },
      // Approval Settings
      requiresApproval: frontendData.approvalSettings?.requiresApproval ?? true,
      autoApproveInfluencers: frontendData.approvalSettings?.autoApproveInfluencers || [],
      approvalInstructions: frontendData.approvalSettings?.approvalInstructions || ''
    }
  }
}

export const campaignService = new CampaignService()