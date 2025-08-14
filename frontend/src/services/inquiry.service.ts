import { apiClient, handleApiError } from '../lib/api'

export interface CreateInquiryData {
  influencerId: string
  packageId: string
  companyName: string
  contactName: string
  email: string
  message: string
  budget?: number
  timeline?: string
  packageDetails: {
    platform: string
    type: string
    price: number
    title?: string
  }
}

export interface Inquiry {
  id: string
  influencerId: string
  packageId: string
  companyName: string
  contactName: string
  email: string
  message: string
  budget?: number
  timeline?: string
  packageDetails: {
    platform: string
    type: string
    price: number
    title?: string
  }
  status: 'PENDING' | 'CONTACTED' | 'NEGOTIATING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED'
  response?: string
  createdAt: string
  respondedAt?: string
  updatedAt: string
  influencer?: {
    id: string
    profile?: {
      firstName?: string
      lastName?: string
      avatarUrl?: string
    }
  }
  package?: any
}

export interface UpdateInquiryStatusData {
  status: 'PENDING' | 'CONTACTED' | 'NEGOTIATING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED'
  response?: string
}

class InquiryService {
  // Create new inquiry (public endpoint)
  async createInquiry(data: CreateInquiryData): Promise<Inquiry> {
    try {
      const response = await apiClient.post('/inquiries', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get received inquiries (for influencers)
  async getReceivedInquiries(filters?: {
    status?: string
    page?: number
    limit?: number
  }): Promise<{
    inquiries: Inquiry[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }> {
    try {
      const params = new URLSearchParams()
      
      if (filters) {
        if (filters.status) params.append('status', filters.status)
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())
      }

      const response = await apiClient.get(`/inquiries/received${params.toString() ? '?' + params.toString() : ''}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get sent inquiries (for brands)
  async getSentInquiries(filters?: {
    status?: string
    page?: number
    limit?: number
  }): Promise<{
    inquiries: Inquiry[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }> {
    try {
      const params = new URLSearchParams()
      
      if (filters) {
        if (filters.status) params.append('status', filters.status)
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())
      }

      const response = await apiClient.get(`/inquiries/sent${params.toString() ? '?' + params.toString() : ''}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get single inquiry
  async getInquiry(id: string): Promise<Inquiry> {
    try {
      const response = await apiClient.get(`/inquiries/${id}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Update inquiry status (for influencers)
  async updateInquiryStatus(id: string, data: UpdateInquiryStatusData): Promise<Inquiry> {
    try {
      const response = await apiClient.put(`/inquiries/${id}/status`, data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Helper method to get status color
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-900'
      case 'contacted': return 'bg-blue-100 text-blue-800'
      case 'negotiating': return 'bg-purple-100 text-purple-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'declined': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper method to get status icon
  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return '⏳'
      case 'contacted': return '📞'
      case 'negotiating': return '💬'
      case 'accepted': return '✅'
      case 'declined': return '❌'
      case 'completed': return '🎉'
      default: return '📄'
    }
  }

  // Helper method to format currency
  formatCurrency(amount: number): string {
    return `$${amount.toLocaleString()}`
  }
}

export const inquiryService = new InquiryService()