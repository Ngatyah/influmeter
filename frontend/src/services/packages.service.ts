import { apiClient, handleApiError } from '../lib/api'

export interface InfluencerPackage {
  id?: string
  platform: string
  packageType: string
  title?: string
  description?: string
  price: number
  deliverables: string[]
  turnaroundDays?: number
  revisions?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreatePackageData {
  platform: string
  packageType: string
  title?: string
  description?: string
  price: number
  deliverables: string[]
  turnaroundDays?: number
  revisions?: number
  isActive?: boolean
}

class PackagesManagementService {
  async getMyPackages(): Promise<InfluencerPackage[]> {
    try {
      const response = await apiClient.get('/packages')
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  async createPackage(data: CreatePackageData): Promise<InfluencerPackage> {
    try {
      const response = await apiClient.post('/packages', data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  async updatePackage(id: string, data: Partial<CreatePackageData>): Promise<InfluencerPackage> {
    try {
      const response = await apiClient.put(`/packages/${id}`, data)
      return response.data
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }

  async deletePackage(id: string): Promise<void> {
    try {
      await apiClient.delete(`/packages/${id}`)
    } catch (error) {
      throw new Error(handleApiError(error))
    }
  }
}

export const packagesManagementService = new PackagesManagementService()