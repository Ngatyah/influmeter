import { apiClient, handleApiError } from '../lib/api'
import { formatSafeDate, formatSafeDatetime } from '../utils/dateUtils'

// Payment Types
export interface Payment {
  id: string
  contentId?: string
  influencerId: string
  brandId: string
  amount: number
  platformFee: number
  netAmount: number
  paymentMethod?: string
  transactionId?: string
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  processedAt?: string
  createdAt: string
  content?: {
    id: string
    title?: string
    contentType: string
    campaign: {
      id: string
      title: string
      brand?: {
        profile?: {
          firstName?: string
          lastName?: string
        }
        brandProfile?: {
          companyName?: string
        }
      }
    }
  }
  influencer?: {
    profile?: {
      firstName?: string
      lastName?: string
    }
  }
}

export interface PaymentStats {
  totalPayments: number
  totalAmount?: number
  totalEarnings?: number
  byStatus: Record<string, {
    count: number
    amount?: number
    earnings?: number
  }>
}

export interface CreatePaymentData {
  influencerId: string
  amount: number
  paymentMethod?: string
}

export interface ProcessPaymentData {
  paymentMethod?: string
  transactionId?: string
}

export interface PaymentFilters {
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  influencerId?: string
  campaignId?: string
  page?: number
  limit?: number
}

class PaymentsService {
  // Create payment for content
  async createContentPayment(contentId: string, data: CreatePaymentData): Promise<Payment> {
    try {
      const response = await apiClient.post(`/payments/content/${contentId}`, data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Create general payment
  async createPayment(data: CreatePaymentData): Promise<Payment> {
    try {
      const response = await apiClient.post('/payments', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Process payment
  async processPayment(paymentId: string, data: ProcessPaymentData): Promise<Payment> {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/process`, data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get payments for current user
  async getPayments(filters?: PaymentFilters): Promise<{
    payments: Payment[]
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
        if (filters.influencerId) params.append('influencerId', filters.influencerId)
        if (filters.campaignId) params.append('campaignId', filters.campaignId)
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())
      }

      const response = await apiClient.get(`/payments${params.toString() ? '?' + params.toString() : ''}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get single payment
  async getPayment(id: string): Promise<Payment> {
    try {
      const response = await apiClient.get(`/payments/${id}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get payment statistics
  async getPaymentStats(): Promise<PaymentStats> {
    try {
      const response = await apiClient.get('/payments/stats/overview')
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get payments for specific campaign and influencer (Brand only)
  async getCampaignInfluencerPayments(
    campaignId: string, 
    influencerId: string
  ): Promise<{
    payments: Payment[]
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }> {
    try {
      const response = await apiClient.get(`/payments/campaign/${campaignId}/influencer/${influencerId}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Helper: Format payment amount
  formatAmount(amount: number): string {
    return `$${amount.toFixed(2)}`
  }

  // Helper: Get status color
  getStatusColor(status: Payment['status']): string {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-900'
      case 'PROCESSING': return 'bg-blue-100 text-blue-800'
      case 'COMPLETED': return 'bg-green-100 text-green-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper: Get status icon
  getStatusIcon(status: Payment['status']): string {
    switch (status) {
      case 'PENDING': return '⏳'
      case 'PROCESSING': return '🔄'
      case 'COMPLETED': return '✅'
      case 'FAILED': return '❌'
      case 'CANCELLED': return '🚫'
      default: return '❓'
    }
  }

  // Helper: Get brand name
  getBrandName(payment: Payment): string {
    if (payment.content?.campaign.brand?.brandProfile?.companyName) {
      return payment.content.campaign.brand.brandProfile.companyName
    }
    if (payment.content?.campaign.brand?.profile?.firstName && payment.content?.campaign.brand?.profile?.lastName) {
      return `${payment.content.campaign.brand.profile.firstName} ${payment.content.campaign.brand.profile.lastName}`
    }
    return 'Unknown Brand'
  }

  // Helper: Get influencer name
  getInfluencerName(payment: Payment): string {
    if (payment.influencer?.profile?.firstName && payment.influencer?.profile?.lastName) {
      return `${payment.influencer.profile.firstName} ${payment.influencer.profile.lastName}`
    }
    return 'Unknown Influencer'
  }

  // Helper: Format date
  formatDate(dateString: string): string {
    return formatSafeDate(dateString)
  }

  // Helper: Format date and time
  formatDateTime(dateString: string): string {
    return formatSafeDatetime(dateString)
  }
}

export const paymentsService = new PaymentsService()