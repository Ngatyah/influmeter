import { apiClient, handleApiError } from '../lib/api'

// Content Types
export interface ContentSubmission {
  id: string
  campaignId: string
  title?: string
  description?: string
  caption?: string
  hashtags: string[]
  platforms: string[]
  contentType: 'IMAGE' | 'VIDEO' | 'STORY' | 'REEL' | 'POST'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'PAID'
  feedback?: string
  amount?: number
  submittedAt: string
  approvedAt?: string
  completedAt?: string
  paidAt?: string
  campaign: {
    id: string
    title: string
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
  }
  files?: ContentFile[]
  performance?: ContentPerformance
  publishedPosts?: PublishedPost[]
}

export interface ContentFile {
  id: string
  fileUrl: string
  fileType: string
  fileSize?: number
  thumbnailUrl?: string
  createdAt: string
}

export interface ContentPerformance {
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  engagementRate?: number
  lastUpdated: string
}

export interface PublishedPost {
  id: string
  contentId: string
  platform: string
  postUrl: string
  platformPostId?: string
  postType?: string
  publishedAt: string
  status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'INVALID_URL' | 'DELETED'
  verifiedAt?: string
  createdAt: string
  updatedAt: string
  performance?: PostPerformance
}

export interface PostPerformance {
  publishedPostId: string
  views: number
  likes: number
  comments: number
  shares: number
  saves: number
  clicks: number
  impressions: number
  reach: number
  engagementRate?: number
  ctr?: number
  lastUpdated: string
}

export interface CreateContentSubmissionData {
  campaignId: string
  title?: string
  description?: string
  caption?: string
  hashtags?: string[]
  platforms?: string[]
  contentType:  '' | 'IMAGE' | 'VIDEO' | 'STORY' | 'REEL' | 'POST'
  amount?: number
}

export interface UpdateContentSubmissionData {
  title?: string
  description?: string
  caption?: string
  hashtags?: string[]
  platforms?: string[]
  amount?: number
}

export interface ContentFilters {
  search?: string
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'PAID'
  contentType?: 'IMAGE' | 'VIDEO' | 'STORY' | 'REEL' | 'POST'
  campaignId?: string
  page?: number
  limit?: number
}

export interface UploadLimits {
  maxFileSize: number
  maxFiles: number
  allowedTypes: string[]
}

class ContentService {
  // Create content submission
  async createContentSubmission(data: CreateContentSubmissionData): Promise<ContentSubmission> {
    try {
      const response = await apiClient.post('/content', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get influencer's content submissions
  async getMyContentSubmissions(filters?: ContentFilters): Promise<{
    contentSubmissions: ContentSubmission[]
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
        if (filters.contentType) params.append('contentType', filters.contentType)
        if (filters.campaignId) params.append('campaignId', filters.campaignId)
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())
      }

      const response = await apiClient.get(`/content/my-submissions${params.toString() ? '?' + params.toString() : ''}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get single content submission
  async getContentSubmission(id: string): Promise<ContentSubmission> {
    try {
      const response = await apiClient.get(`/content/${id}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Update content submission
  async updateContentSubmission(id: string, data: UpdateContentSubmissionData): Promise<ContentSubmission> {
    try {
      const response = await apiClient.put(`/content/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Upload files for content submission
  async uploadFiles(contentId: string, files: File[]): Promise<{
    message: string
    files: any[]
    count: number
  }> {
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await apiClient.post(`/content/upload/${contentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Add upload progress tracking
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(`Upload progress: ${percentCompleted}%`)
          }
        }
      })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get files for content submission
  async getContentFiles(contentId: string): Promise<ContentFile[]> {
    try {
      const response = await apiClient.get(`/content/${contentId}/files`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Update performance data
  async updatePerformance(contentId: string, performance: {
    views: number
    likes: number
    comments: number
    shares: number
    saves: number
    engagementRate?: number
  }): Promise<ContentPerformance> {
    try {
      const response = await apiClient.put(`/content/${contentId}/performance`, performance)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Delete content submission
  async deleteContentSubmission(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/content/${id}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get upload limits
  async getUploadLimits(): Promise<UploadLimits> {
    try {
      const response = await apiClient.get('/content/upload/limits')
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Helper: Get status color
  getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Helper: Get status icon
  getStatusIcon(status: string) {
    switch (status.toLowerCase()) {
      case 'pending': return '🔄'
      case 'approved': return '✅'
      case 'rejected': return '❌'
      case 'completed': return '📋'
      case 'paid': return '💰'
      default: return '📄'
    }
  }

  // Helper: Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Helper: Check if file is image
  isImageFile(fileType: string): boolean {
    return fileType.startsWith('image/')
  }

  // Helper: Check if file is video
  isVideoFile(fileType: string): boolean {
    return fileType.startsWith('video/')
  }

  // Get brand content submissions
  async getBrandContentSubmissions(filters?: ContentFilters): Promise<{
    contentSubmissions: ContentSubmission[]
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
        if (filters.contentType) params.append('contentType', filters.contentType)
        if (filters.campaignId) params.append('campaignId', filters.campaignId)
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())
      }

      const response = await apiClient.get(`/content/brand-content${params.toString() ? '?' + params.toString() : ''}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Update content status (Brand only)
  async updateContentStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'PAID', feedback?: string): Promise<ContentSubmission> {
    try {
      const response = await apiClient.put(`/content/${id}/status`, { status, feedback })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Approve content (Brand only)
  async approveContent(id: string, feedback?: string): Promise<ContentSubmission> {
    try {
      const response = await apiClient.post(`/content/${id}/approve`, { feedback })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Reject content (Brand only)
  async rejectContent(id: string, feedback?: string): Promise<ContentSubmission> {
    try {
      const response = await apiClient.post(`/content/${id}/reject`, { feedback })
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Get content submissions by influencer for specific campaign (Brand only)
  async getInfluencerContentForCampaign(
    influencerId: string, 
    campaignId: string, 
    filters?: ContentFilters
  ): Promise<{
    contentSubmissions: ContentSubmission[]
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
        if (filters.contentType) params.append('contentType', filters.contentType)
        if (filters.page) params.append('page', filters.page.toString())
        if (filters.limit) params.append('limit', filters.limit.toString())
      }

      const response = await apiClient.get(
        `/content/influencer/${influencerId}/campaign/${campaignId}${params.toString() ? '?' + params.toString() : ''}`
      )
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Published Post Methods
  async submitPublishedPost(data: {
    contentId: string
    platform: string
    postUrl: string
    postType?: string
    publishedAt: string
  }): Promise<any> {
    try {
      const response = await apiClient.post('/content/published-posts', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  async getPublishedPosts(contentId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/content/${contentId}/published-posts`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  async updatePublishedPost(postId: string, data: {
    postUrl?: string
    postType?: string
    publishedAt?: string
  }): Promise<any> {
    try {
      const response = await apiClient.put(`/content/published-posts/${postId}`, data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  async deletePublishedPost(postId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete(`/content/published-posts/${postId}`)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  // Helper: Validate social media URL
  validateSocialMediaUrl(url: string, platform: string): { isValid: boolean; error?: string } {
    const urlRegex = /^https?:\/\/(www\.)?/i
    
    if (!url || !urlRegex.test(url)) {
      return { isValid: false, error: 'Please enter a valid URL starting with http:// or https://' }
    }

    const platformPatterns = {
      instagram: /instagram\.com\/(p|reel|stories)\/[\w-]+/i,
      tiktok: /tiktok\.com\/@[\w.-]+\/video\/\d+/i,
      youtube: /youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+|youtube\.com\/shorts\/[\w-]+/i,
      twitter: /twitter\.com\/[\w]+\/status\/\d+|x\.com\/[\w]+\/status\/\d+/i,
      facebook: /facebook\.com\/[\w.-]+\/posts\/\d+/i
    }

    const pattern = platformPatterns[platform.toLowerCase()]
    if (pattern && !pattern.test(url)) {
      return { 
        isValid: false, 
        error: `URL doesn't match ${platform} post format. Please check the URL and try again.` 
      }
    }

    return { isValid: true }
  }

  // Helper: Extract post ID from URL
  extractPostId(url: string, platform: string): string | null {
   const patterns: Record<string, RegExp> = {
  instagram: /instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/,
  tiktok: /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
  youtube: /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]+)/,
  twitter: /(?:twitter|x)\.com\/[\w]+\/status\/(\d+)/,
  facebook: /facebook\.com\/[\w.-]+\/posts\/(\d+)/
};

const pattern = patterns[platform.toLowerCase()];
      if (pattern) {
        const match = url.match(pattern)
        return match ? match[match.length - 1] : null
      }
      
      return null
    } catch (error:any) {
        console.error(error);
      return null
    }
  }


export const contentService = new ContentService()