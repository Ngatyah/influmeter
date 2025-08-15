import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowRight, 
  Target, 
  Users, 
  DollarSign, 
  FileText, 
  Settings,
  Save,
  Send,
  Upload,
  X,
  Loader2,
  CheckCircle,
  Image
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Checkbox } from '../../components/ui/checkbox'
import { useToastActions } from '../../components/ui/toast-provider'
import { campaignService } from '../../services/campaign.service'

interface CampaignData {
  title: string
  objective: string
  description: string
  targetAudience: {
    ageRange: string
    gender: string
    location: string[]
    interests: string[]
  }
  budget: {
    total: string
    perInfluencer: string
    currency: string
  }
  timeline: {
    startDate: string
    endDate: string
    submissionDeadline: string
  }
  contentBrief: {
    description: string
    requirements: string[]
    platforms: string[]
    files: File[]
    existingFiles: Array<{
      id: string
      fileName: string
      fileUrl: string
      fileSize: number
      uploadedAt: string
    }>
  }
  influencerRequirements: {
    minFollowers: string
    maxFollowers: string
    engagementRate: string
    maxParticipants: string
    niches: string[]
    location: string[]
    platformFollowers: { [platform: string]: string }
    pastPerformance: {
      conversionRate: string
      completionRate: string
      requireExperience: boolean
      requireReferralCodes: boolean
      requireClickTracking: boolean
    }
    contentTypes: string[]
    accountHealth: {
      publicAccount: boolean
      verifiedAccount: boolean
      consistentPosting: boolean
      noFakeFollowers: boolean
      authenticEngagement: boolean
      completeProfile: boolean
    }
    verification: {
      verifiedEmail: boolean
      phoneVerification: boolean
      paymentDetails: boolean
      taxInformation: boolean
    }
    platformVerification: string[]
    locationSpecific: boolean
    manualApproval: boolean
    requireHighQuality: boolean
  }
  approvalSettings: {
    requiresApproval: boolean
    autoApproveInfluencers: string[]
    approvalInstructions: string
    trustMode: 'strict' | 'moderate' | 'flexible'
  }
}

const steps = [
  { id: 1, title: 'Campaign Details', icon: Target },
  { id: 2, title: 'Target Audience', icon: Users },
  { id: 3, title: 'Budget & Timeline', icon: DollarSign },
  { id: 4, title: 'Content Brief', icon: FileText },
  { id: 5, title: 'Influencer Requirements', icon: Settings },
  { id: 6, title: 'Approval Settings', icon: CheckCircle },
]

export default function CreateCampaign() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { success, error: showError } = useToastActions()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingCampaign, setLoadingCampaign] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([])
  const isEditing = !!id
  const [campaignData, setCampaignData] = useState<CampaignData>({
    title: '',
    objective: '',
    description: '',
    targetAudience: {
      ageRange: '',
      gender: '',
      location: [],
      interests: []
    },
    budget: {
      total: '',
      perInfluencer: '',
      currency: 'USD'
    },
    timeline: {
      startDate: '',
      endDate: '',
      submissionDeadline: ''
    },
    contentBrief: {
      description: '',
      requirements: [],
      platforms: [],
      files: [],
      existingFiles: []
    },
    influencerRequirements: {
      minFollowers: '',
      maxFollowers: '',
      engagementRate: '',
      maxParticipants: '',
      niches: [],
      location: [],
      platformFollowers: {},
      pastPerformance: {
        conversionRate: '',
        completionRate: '',
        requireExperience: false,
        requireReferralCodes: false,
        requireClickTracking: false
      },
      contentTypes: [],
      accountHealth: {
        publicAccount: true,
        verifiedAccount: false,
        consistentPosting: true,
        noFakeFollowers: true,
        authenticEngagement: true,
        completeProfile: true
      },
      verification: {
        verifiedEmail: true,
        phoneVerification: false,
        paymentDetails: true,
        taxInformation: false
      },
      platformVerification: ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Facebook'],
      locationSpecific: false,
      manualApproval: false,
      requireHighQuality: false
    },
    approvalSettings: {
      requiresApproval: true,
      autoApproveInfluencers: [],
      approvalInstructions: '',
      trustMode: 'moderate'
    }
  })

  const updateCampaignData = (section: keyof CampaignData, data: any) => {
    setCampaignData(prev => {
      if (typeof prev[section] === 'object' && prev[section] !== null && !Array.isArray(prev[section])) {
        return {
          ...prev,
          [section]: { ...(prev[section] as object), ...data }
        }
      } else {
        return {
          ...prev,
          [section]: data
        }
      }
    })
  }

  // Load campaign data when editing
  useEffect(() => {
    if (isEditing && id) {
      const loadCampaignData = async () => {
        try {
          setLoadingCampaign(true)
          setError(null)
          const campaign = await campaignService.getCampaign(id)
          
          // Transform campaign data to match our form structure
          // Extract data from nested objects where it's actually stored
          const targetAudience = campaign.targetCriteria?.targetAudience || {}
          const influencerReqs = campaign.targetCriteria?.influencerRequirements || {}
          const contentBrief = campaign.requirements?.contentBrief || {}
          
          setCampaignData({
            title: campaign.title || '',
            objective: campaign.objective || '',
            description: campaign.description || '',
            targetAudience: {
              ageRange: targetAudience.ageRange || '',
              gender: targetAudience.gender || '',
              location: Array.isArray(targetAudience.location) ? targetAudience.location : [],
              interests: Array.isArray(targetAudience.interests) ? targetAudience.interests : []
            },
            budget: {
              total: campaign.budget?.toString() || '',
              perInfluencer: '',
              currency: 'USD'
            },
            timeline: {
              startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
              endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
              submissionDeadline: campaign.requirements?.submissionDeadline ? campaign.requirements.submissionDeadline.split('T')[0] : ''
            },
            contentBrief: {
              description: contentBrief.description || campaign.contentBrief || '',
              requirements: Array.isArray(contentBrief.requirements) ? contentBrief.requirements : [],
              platforms: Array.isArray(contentBrief.platforms) ? contentBrief.platforms : [],
              files: [],
              existingFiles: Array.isArray(campaign.briefFiles) ? campaign.briefFiles : []
            },
            influencerRequirements: {
              minFollowers: influencerReqs.minFollowers?.toString() || '',
              maxFollowers: influencerReqs.maxFollowers?.toString() || '',
              engagementRate: influencerReqs.engagementRate?.toString() || '',
              maxParticipants: campaign.maxInfluencers?.toString() || influencerReqs.maxParticipants?.toString() || '',
              niches: Array.isArray(influencerReqs.niches) ? influencerReqs.niches : [],
              location: Array.isArray(influencerReqs.location) ? influencerReqs.location : [],
              platformFollowers: influencerReqs.platformFollowers || {},
              pastPerformance: {
                conversionRate: influencerReqs.pastPerformance?.conversionRate || '',
                completionRate: influencerReqs.pastPerformance?.completionRate || '',
                requireExperience: influencerReqs.pastPerformance?.requireExperience || false,
                requireReferralCodes: influencerReqs.pastPerformance?.requireReferralCodes || false,
                requireClickTracking: influencerReqs.pastPerformance?.requireClickTracking || false
              },
              contentTypes: Array.isArray(influencerReqs.contentTypes) ? influencerReqs.contentTypes : [],
              accountHealth: {
                publicAccount: influencerReqs.accountHealth?.publicAccount ?? true,
                verifiedAccount: influencerReqs.accountHealth?.verifiedAccount ?? false,
                consistentPosting: influencerReqs.accountHealth?.consistentPosting ?? true,
                noFakeFollowers: influencerReqs.accountHealth?.noFakeFollowers ?? true,
                authenticEngagement: influencerReqs.accountHealth?.authenticEngagement ?? true,
                completeProfile: influencerReqs.accountHealth?.completeProfile ?? true
              },
              verification: {
                verifiedEmail: influencerReqs.verification?.verifiedEmail ?? true,
                phoneVerification: influencerReqs.verification?.phoneVerification ?? false,
                paymentDetails: influencerReqs.verification?.paymentDetails ?? true,
                taxInformation: influencerReqs.verification?.taxInformation ?? false
              },
              platformVerification: Array.isArray(influencerReqs.platformVerification) 
                ? influencerReqs.platformVerification 
                : ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Facebook'],
              locationSpecific: influencerReqs.locationSpecific ?? false,
              manualApproval: influencerReqs.manualApproval ?? false,
              requireHighQuality: influencerReqs.requireHighQuality ?? false
            },
            approvalSettings: {
              requiresApproval: campaign.requiresApproval ?? true,
              autoApproveInfluencers: Array.isArray(campaign.autoApproveInfluencers) ? campaign.autoApproveInfluencers : [],
              approvalInstructions: campaign.approvalInstructions || '',
              trustMode: 'moderate'
            }
          })
        } catch (err) {
          console.error('Failed to load campaign:', err)
          setError('Failed to load campaign data')
          showError('Failed to load campaign data')
        } finally {
          setLoadingCampaign(false)
        }
      }

      loadCampaignData()
    }
  }, [isEditing, id, showError])

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const saveDraft = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const campaignPayload = campaignService.transformCampaignData(campaignData)
      
      let resultCampaign
      if (isEditing && id) {
        // Update existing campaign (don't include status in payload)
        resultCampaign = await campaignService.updateCampaign(id, campaignPayload)
        console.log('Campaign updated:', resultCampaign)
        
        // Delete removed files if any
        if (removedFileIds.length > 0) {
          try {
            await campaignService.deleteBriefFiles(id, removedFileIds)
            console.log('Removed files deleted:', removedFileIds)
            setRemovedFileIds([]) // Clear the removed files list
          } catch (fileDeleteError) {
            console.error('Failed to delete some files:', fileDeleteError)
            // Don't fail the entire update if file deletion fails
          }
        }
      } else {
        // Create new campaign (include status for creation)
        campaignPayload.status = 'DRAFT'
        resultCampaign = await campaignService.createCampaign(campaignPayload)
        console.log('Campaign saved as draft:', resultCampaign)
      }
      
      // Upload brief files if any were selected
      if (campaignData.contentBrief.files && campaignData.contentBrief.files.length > 0) {
        try {
          const uploadResult = await campaignService.uploadBriefFiles(resultCampaign.id, campaignData.contentBrief.files)
          console.log('Brief files uploaded:', uploadResult)
        } catch (fileUploadError) {
          console.error('Failed to upload brief files:', fileUploadError)
          // Don't fail the entire campaign creation if file upload fails
        }
      }
      
      // Show success toast and navigate
      success(
        isEditing ? 'Campaign Updated!' : 'Draft Saved!', 
        isEditing 
          ? 'Your campaign has been updated successfully.'
          : 'Your campaign has been saved as a draft. You can continue editing it later.',
        {
          action: {
            label: 'View Campaign',
            onClick: () => navigate(`/campaigns/${resultCampaign.id}`)
          }
        }
      )
      
      // Navigate after a short delay to let user see the toast
      setTimeout(() => navigate(`/campaigns/${resultCampaign.id}`), 1500)
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'save'} campaign:`, error)
      setError(error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'save'} campaign`)
    } finally {
      setLoading(false)
    }
  }

  const launchCampaign = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Basic validation
      if (!campaignData.title || !campaignData.objective) {
        setError('Please fill in all required fields (title and objective)')
        return
      }
      
      const campaignPayload = campaignService.transformCampaignData(campaignData)
      
      let resultCampaign
      if (isEditing && id) {
        // Update existing campaign
        resultCampaign = await campaignService.updateCampaign(id, campaignPayload)
        
        // Delete removed files if any
        if (removedFileIds.length > 0) {
          try {
            await campaignService.deleteBriefFiles(id, removedFileIds)
            console.log('Removed files deleted:', removedFileIds)
            setRemovedFileIds([]) // Clear the removed files list
          } catch (fileDeleteError) {
            console.error('Failed to delete some files:', fileDeleteError)
            // Don't fail the entire update if file deletion fails
          }
        }
        
        // If the campaign is currently a draft, optionally make it active
        if (resultCampaign.status === 'DRAFT') {
          resultCampaign = await campaignService.updateCampaignStatus(id, 'ACTIVE')
        }
        console.log('Campaign updated and activated:', resultCampaign)
      } else {
        // Create new campaign and launch it
        campaignPayload.status = 'ACTIVE'
        resultCampaign = await campaignService.createCampaign(campaignPayload)
        console.log('Campaign launched:', resultCampaign)
      }
      
      // Upload brief files if any were selected
      if (campaignData.contentBrief.files && campaignData.contentBrief.files.length > 0) {
        try {
          const uploadResult = await campaignService.uploadBriefFiles(resultCampaign.id, campaignData.contentBrief.files)
          console.log('Brief files uploaded:', uploadResult)
        } catch (fileUploadError) {
          console.error('Failed to upload brief files:', fileUploadError)
          // Don't fail the entire campaign creation if file upload fails
        }
      }
      
      // Show success toast and navigate
      success(
        isEditing ? 'Campaign Updated! ✅' : 'Campaign Launched! 🚀', 
        isEditing 
          ? 'Your campaign has been updated successfully and is ready to receive applications!'
          : 'Your campaign is now live and visible to influencers. Start receiving applications soon!',
        {
          duration: 6000,
          action: {
            label: 'View Campaign',
            onClick: () => navigate(`/campaigns/${resultCampaign.id}`)
          }
        }
      )
      
      // Navigate after a short delay to let user see the toast
      setTimeout(() => navigate('/campaigns'), 2000)
    } catch (error) {
      console.error('Failed to launch campaign:', error)
      setError(error instanceof Error ? error.message : 'Failed to launch campaign')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state when loading campaign data for editing
  if (loadingCampaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading campaign data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/brand')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {isEditing ? 'Edit Campaign' : 'Create Campaign'}
              </h1>
              <p className="text-slate-600">Step {currentStep} of {steps.length}</p>
            </div>
          </div>
          <Button variant="outline" onClick={saveDraft} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {isEditing ? 'Update Campaign' : 'Save Draft'}
          </Button>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-sm text-red-800">{error}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Progress Sidebar */}
        <aside className="w-80 bg-white/80 backdrop-blur-sm border-r border-slate-200 p-6">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              const Icon = step.icon

              return (
                <div 
                  key={step.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : isCompleted 
                        ? 'bg-green-50 text-green-700'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => setCurrentStep(step.id)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive 
                      ? 'bg-primary-foreground text-primary' 
                      : isCompleted 
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-300 text-slate-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{step.title}</span>
                </div>
              )
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm max-w-4xl mx-auto">
            <CardContent className="p-8">
              {currentStep === 1 && (
                <CampaignDetailsStep 
                  data={campaignData}
                  updateData={updateCampaignData}
                />
              )}
              {currentStep === 2 && (
                <TargetAudienceStep 
                  data={campaignData}
                  updateData={updateCampaignData}
                />
              )}
              {currentStep === 3 && (
                <BudgetTimelineStep 
                  data={campaignData}
                  updateData={updateCampaignData}
                />
              )}
              {currentStep === 4 && (
                <ContentBriefStep 
                  data={campaignData}
                  updateData={updateCampaignData}
                  setRemovedFileIds={setRemovedFileIds}
                />
              )}
              {currentStep === 5 && (
                <InfluencerRequirementsStep 
                  data={campaignData}
                  updateData={updateCampaignData}
                />
              )}
              {currentStep === 6 && (
                <ApprovalSettingsStep 
                  data={campaignData}
                  updateData={updateCampaignData}
                />
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex space-x-3">
                  {currentStep === steps.length ? (
                    <Button onClick={launchCampaign} className="bg-primary hover:bg-primary/90" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                      {isEditing ? 'Update Campaign' : 'Launch Campaign'}
                    </Button>
                  ) : (
                    <Button onClick={nextStep}>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}

// Step Components
function CampaignDetailsStep({ data, updateData }: { data: CampaignData, updateData: Function }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Campaign Details</h2>
        <p className="text-slate-600">Provide basic information about your campaign.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Title</label>
          <Input
            placeholder="e.g., Summer Skincare Launch"
            value={data.title}
            onChange={(e) => updateData('title', e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Objective</label>
          <select 
            className="w-full h-12 px-3 border border-slate-200 rounded-md bg-white"
            value={data.objective}
            onChange={(e) => updateData('objective', e.target.value)}
          >
            <option value="">Select objective</option>
            <option value="brand_awareness">Brand Awareness</option>
            <option value="product_launch">Product Launch</option>
            <option value="engagement">Engagement</option>
            <option value="sales">Sales/Conversions</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Description</label>
          <textarea
            placeholder="Describe your campaign goals, key messages, and what you want to achieve..."
            value={data.description}
            onChange={(e) => updateData('description', e.target.value)}
            className="w-full h-32 p-3 border border-slate-200 rounded-md resize-none"
          />
        </div>
      </div>
    </div>
  )
}

function TargetAudienceStep({ data, updateData }: { data: CampaignData, updateData: Function }) {
  const interests = ['Fashion', 'Beauty', 'Fitness', 'Technology', 'Food', 'Travel', 'Lifestyle', 'Gaming']
  const locations = ['Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Nigeria', 'South Africa']

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Target Audience</h2>
        <p className="text-slate-600">Define who you want to reach with this campaign.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Age Range</label>
          <select 
            className="w-full h-12 px-3 border border-slate-200 rounded-md bg-white"
            value={data.targetAudience.ageRange}
            onChange={(e) => updateData('targetAudience', { ageRange: e.target.value })}
          >
            <option value="">Select age range</option>
            <option value="18-24">18-24</option>
            <option value="25-34">25-34</option>
            <option value="35-44">35-44</option>
            <option value="45+">45+</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Gender</label>
          <select 
            className="w-full h-12 px-3 border border-slate-200 rounded-md bg-white"
            value={data.targetAudience.gender}
            onChange={(e) => updateData('targetAudience', { gender: e.target.value })}
          >
            <option value="">Select gender</option>
            <option value="all">All</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Target Locations</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {locations.map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox
                id={location}
                checked={data.targetAudience.location.includes(location)}
                onCheckedChange={(checked) => {
                  const newLocations = checked 
                    ? [...data.targetAudience.location, location]
                    : data.targetAudience.location.filter(l => l !== location)
                  updateData('targetAudience', { location: newLocations })
                }}
              />
              <label htmlFor={location} className="text-sm text-slate-700">{location}</label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Interests</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {interests.map((interest) => (
            <div key={interest} className="flex items-center space-x-2">
              <Checkbox
                id={interest}
                checked={data.targetAudience.interests.includes(interest)}
                onCheckedChange={(checked) => {
                  const newInterests = checked 
                    ? [...data.targetAudience.interests, interest]
                    : data.targetAudience.interests.filter(i => i !== interest)
                  updateData('targetAudience', { interests: newInterests })
                }}
              />
              <label htmlFor={interest} className="text-sm text-slate-700">{interest}</label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BudgetTimelineStep({ data, updateData }: { data: CampaignData, updateData: Function }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Budget & Timeline</h2>
        <p className="text-slate-600">Set your campaign budget and important dates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Total Budget</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="5000"
              value={data.budget.total}
              onChange={(e) => updateData('budget', { total: e.target.value })}
              className="pl-10 h-12"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Per Influencer</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="200"
              value={data.budget.perInfluencer}
              onChange={(e) => updateData('budget', { perInfluencer: e.target.value })}
              className="pl-10 h-12"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
          <Input
            type="date"
            value={data.timeline.startDate}
            onChange={(e) => updateData('timeline', { startDate: e.target.value })}
            className="h-12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
          <Input
            type="date"
            value={data.timeline.endDate}
            onChange={(e) => updateData('timeline', { endDate: e.target.value })}
            className="h-12"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Submission Deadline</label>
          <Input
            type="date"
            value={data.timeline.submissionDeadline}
            onChange={(e) => updateData('timeline', { submissionDeadline: e.target.value })}
            className="h-12"
          />
        </div>
      </div>
    </div>
  )
}

function ContentBriefStep({ data, updateData, setRemovedFileIds }: { data: CampaignData, updateData: Function, setRemovedFileIds: React.Dispatch<React.SetStateAction<string[]>> }) {
  const { success, error: showError, warning } = useToastActions()
  const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Facebook']
  const contentRequirements = [
    'Include brand hashtag',
    'Tag brand account',
    'Show product clearly',
    'Include call-to-action',
    'Use provided copy',
    'Include disclaimer'
  ]

  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)

  const validateAndProcessFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return []

    // Validate files
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    const validFiles = fileArray.filter(file => {
      if (file.size > maxSize) {
        showError(
          'File Too Large',
          `${file.name} is too large. Maximum size is 10MB.`
        )
        return false
      }
      if (!allowedTypes.includes(file.type)) {
        showError(
          'Invalid File Type',
          `${file.name} has unsupported type. Only JPG, PNG, and PDF files are allowed.`
        )
        return false
      }
      return true
    })

    return validFiles
  }

  const processFiles = async (validFiles: File[]) => {
    if (validFiles.length === 0) return

    setUploadingFiles(true)
    setUploadProgress(0)

    try {
      // For now, we'll just add files to the form data
      // In a real implementation, you would upload to a file service
      updateData('contentBrief', { 
        files: [...data.contentBrief.files, ...validFiles]
      })
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            setUploadingFiles(false)
            
            // Show success toast when upload completes
            success(
              `Files Uploaded Successfully!`,
              `${validFiles.length} file${validFiles.length > 1 ? 's' : ''} added to your campaign.`
            )
            
            return 100
          }
          return prev + 10
        })
      }, 100)

    } catch (error) {
      console.error('File upload failed:', error)
      showError('Upload Failed', 'File upload failed. Please try again.')
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    
    const validFiles = validateAndProcessFiles(files)
    await processFiles(validFiles)
    
    // Reset input
    event.target.value = ''
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragOver(false)
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragOver(false)
    
    const files = event.dataTransfer.files
    if (!files) return
    
    const validFiles = validateAndProcessFiles(files)
    await processFiles(validFiles)
  }

  const removeFile = (indexToRemove: number) => {
    const updatedFiles = data.contentBrief.files.filter((_, index) => index !== indexToRemove)
    updateData('contentBrief', { files: updatedFiles })
  }

  const removeExistingFile = (fileIdToRemove: string) => {
    const updatedExistingFiles = data.contentBrief.existingFiles.filter(file => file.id !== fileIdToRemove)
    updateData('contentBrief', { existingFiles: updatedExistingFiles })
    
    // Track removed file for deletion during save
    setRemovedFileIds(prev => [...prev, fileIdToRemove])
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Content Brief</h2>
        <p className="text-slate-600">Provide guidelines and requirements for content creation.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Content Description</label>
        <textarea
          placeholder="Describe the type of content you want, style, tone, key messages..."
          value={data.contentBrief.description}
          onChange={(e) => updateData('contentBrief', { description: e.target.value })}
          className="w-full h-32 p-3 border border-slate-200 rounded-md resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Platforms</label>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {platforms.map((platform) => (
            <div key={platform} className="flex items-center space-x-2">
              <Checkbox
                id={platform}
                checked={data.contentBrief.platforms.includes(platform)}
                onCheckedChange={(checked) => {
                  const newPlatforms = checked 
                    ? [...data.contentBrief.platforms, platform]
                    : data.contentBrief.platforms.filter(p => p !== platform)
                  updateData('contentBrief', { platforms: newPlatforms })
                }}
              />
              <label htmlFor={platform} className="text-sm text-slate-700">{platform}</label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Content Requirements</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contentRequirements.map((requirement) => (
            <div key={requirement} className="flex items-center space-x-2">
              <Checkbox
                id={requirement}
                checked={data.contentBrief.requirements.includes(requirement)}
                onCheckedChange={(checked) => {
                  const newRequirements = checked 
                    ? [...data.contentBrief.requirements, requirement]
                    : data.contentBrief.requirements.filter(r => r !== requirement)
                  updateData('contentBrief', { requirements: newRequirements })
                }}
              />
              <label htmlFor={requirement} className="text-sm text-slate-700">{requirement}</label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Upload Brand Assets</label>
        
        {/* File Upload Area */}
        <div className="space-y-4">
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              dragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-slate-200 hover:border-slate-300'
            }`}
            onClick={() => document.getElementById('file-upload')?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {uploadingFiles ? (
              <div className="space-y-3">
                <Loader2 className="w-8 h-8 text-slate-400 mx-auto animate-spin" />
                <p className="text-sm text-slate-600">Uploading files...</p>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500">{uploadProgress}% complete</p>
              </div>
            ) : (
              <div>
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Drag and drop files or click to browse</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF up to 10MB</p>
              </div>
            )}
          </div>

          {/* Uploaded Files List */}
          {(data.contentBrief.existingFiles.length > 0 || data.contentBrief.files.length > 0) && (
            <div className="space-y-3">
              {/* Existing Files */}
              {data.contentBrief.existingFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    Existing Files ({data.contentBrief.existingFiles.length})
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {data.contentBrief.existingFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-200 rounded flex items-center justify-center">
                            {file.fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <Image className="w-4 h-4 text-blue-600" />
                            ) : (
                              <FileText className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate max-w-xs">
                              {file.fileName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatFileSize(file.fileSize)} • Uploaded {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                          >
                            View
                          </a>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExistingFile(file.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Newly Uploaded Files */}
              {data.contentBrief.files.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">
                    New Files ({data.contentBrief.files.length})
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {data.contentBrief.files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-200 rounded flex items-center justify-center">
                            {file.type.startsWith('image/') ? (
                              <Image className="w-4 h-4 text-green-600" />
                            ) : (
                              <FileText className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 truncate max-w-xs">
                              {file.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatFileSize(file.size)} • Just uploaded
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfluencerRequirementsStep({ data, updateData }: { data: CampaignData, updateData: Function }) {
  const niches = [
    'Fashion', 'Beauty', 'Tech', 'Parenting', 'Food', 'Fitness', 
    'Lifestyle', 'Gaming', 'Health', 'Travel', 'Business', 'Education'
  ]
  const locations = ['Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Nigeria', 'South Africa', 'Ghana', 'Ethiopia']
  const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Facebook']
  const contentTypes = ['Reels', 'Stories', 'Static Posts', 'YouTube Shorts', 'Live Videos', 'IGTV']

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Influencer Requirements</h2>
        <p className="text-slate-600">Define comprehensive criteria for influencers who can join this campaign.</p>
      </div>

      {/* Follower Thresholds */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">1. Minimum Follower Thresholds</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <div key={platform} className="border border-slate-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">{platform}</label>
              <Input
                placeholder="10,000"
                className="h-10"
                // Add state management for platform-specific followers
              />
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Rate */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">2. Engagement Rate Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Engagement Rate (%)</label>
            <Input
              placeholder="3.0"
              value={data.influencerRequirements.engagementRate}
              onChange={(e) => updateData('influencerRequirements', { engagementRate: e.target.value })}
              className="h-10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Platform Priority</label>
            <select className="w-full h-10 px-3 border border-slate-200 rounded-md bg-white">
              <option value="">Select platform</option>
              {platforms.map(platform => (
                <option key={platform} value={platform.toLowerCase()}>{platform}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Calculation Period</label>
            <select className="w-full h-10 px-3 border border-slate-200 rounded-md bg-white">
              <option value="last_30_days">Last 30 days</option>
              <option value="last_90_days">Last 90 days</option>
              <option value="last_6_months">Last 6 months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Past Performance Requirements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">3. Past Campaign Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
           {[
  { label: 'Minimum Conversion Rate (%)', placeholder: '2.5' },
  { label: 'Minimum Campaign Completion Rate (%)', placeholder: '95' }
].map((field) => (
  <div key={field.label}>
    <label className="block text-sm font-medium text-slate-700 mb-2">{field.label}</label>
    <Input placeholder={field.placeholder} className="h-10" />
  </div>
))}

          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="require_past_campaigns"
                checked={data.influencerRequirements.pastPerformance.requireExperience}
                onCheckedChange={(checked) => {
                  updateData('influencerRequirements', {
                    pastPerformance: {
                      ...data.influencerRequirements.pastPerformance,
                      requireExperience: !!checked
                    }
                  })
                }}
              />
              <label htmlFor="require_past_campaigns" className="text-sm text-slate-700">
                Require previous campaign experience
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="require_referral_codes"
                checked={data.influencerRequirements.pastPerformance.requireReferralCodes}
                onCheckedChange={(checked) => {
                  updateData('influencerRequirements', {
                    pastPerformance: {
                      ...data.influencerRequirements.pastPerformance,
                      requireReferralCodes: !!checked
                    }
                  })
                }}
              />
              <label htmlFor="require_referral_codes" className="text-sm text-slate-700">
                Must have used referral/promo codes before
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="require_click_tracking"
                checked={data.influencerRequirements.pastPerformance.requireClickTracking}
                onCheckedChange={(checked) => {
                  updateData('influencerRequirements', {
                    pastPerformance: {
                      ...data.influencerRequirements.pastPerformance,
                      requireClickTracking: !!checked
                    }
                  })
                }}
              />
              <label htmlFor="require_click_tracking" className="text-sm text-slate-700">
                Must provide click-through analytics
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Content Category & Niche */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">4. Content Category (Niche)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {niches.map((niche) => (
            <div key={niche} className="flex items-center space-x-2">
              <Checkbox
                id={`niche-${niche}`}
                checked={data.influencerRequirements.niches.includes(niche)}
                onCheckedChange={(checked) => {
                  const newNiches = checked 
                    ? [...data.influencerRequirements.niches, niche]
                    : data.influencerRequirements.niches.filter(n => n !== niche)
                  updateData('influencerRequirements', { niches: newNiches })
                }}
              />
              <label htmlFor={`niche-${niche}`} className="text-sm text-slate-700">{niche}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Requirements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">5. Geographic Location</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="location_specific"
              checked={data.influencerRequirements.locationSpecific}
              onCheckedChange={(checked) => {
                updateData('influencerRequirements', {
                  locationSpecific: !!checked
                })
              }}
            />
            <label htmlFor="location_specific" className="text-sm font-medium text-slate-700">
              This campaign is location-specific
            </label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {locations.map((location) => (
              <div key={location} className="flex items-center space-x-2">
                <Checkbox
                  id={`location-${location}`}
                  checked={data.influencerRequirements.location.includes(location)}
                  onCheckedChange={(checked) => {
                    const newLocations = checked 
                      ? [...data.influencerRequirements.location, location]
                      : data.influencerRequirements.location.filter(l => l !== location)
                    updateData('influencerRequirements', { location: newLocations })
                  }}
                />
                <label htmlFor={`location-${location}`} className="text-sm text-slate-700">{location}</label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Style Requirements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">6. Content Style & Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Required Content Types</label>
            <div className="space-y-2">
              {contentTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`content-${type}`}
                    checked={data.influencerRequirements.contentTypes.includes(type)}
                    onCheckedChange={(checked) => {
                      const newContentTypes = checked 
                        ? [...data.influencerRequirements.contentTypes, type]
                        : data.influencerRequirements.contentTypes.filter(t => t !== type)
                      updateData('influencerRequirements', { contentTypes: newContentTypes })
                    }}
                  />
                  <label htmlFor={`content-${type}`} className="text-sm text-slate-700">{type}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Average Views</label>
              <Input placeholder="50,000" className="h-10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Minimum Audience Retention (%)</label>
              <Input placeholder="65" className="h-10" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="require_high_quality"
                checked={data.influencerRequirements.requireHighQuality}
                onCheckedChange={(checked) => {
                  updateData('influencerRequirements', {
                    requireHighQuality: !!checked
                  })
                }}
              />
              <label htmlFor="require_high_quality" className="text-sm text-slate-700">
                Require high-quality content (HD/4K)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Approval Process */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">7. Approval Process</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Campaign Access</label>
              <select className="w-full h-10 px-3 border border-slate-200 rounded-md bg-white">
                <option value="open">Open to all qualified influencers</option>
                <option value="application">Requires application</option>
                <option value="invite_only">Invite only</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="manual_approval"
                checked={data.influencerRequirements.manualApproval}
                onCheckedChange={(checked) => {
                  updateData('influencerRequirements', {
                    manualApproval: !!checked
                  })
                }}
              />
              <label htmlFor="manual_approval" className="text-sm text-slate-700">
                Manual approval required for high-value campaigns
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Maximum Participants</label>
              <Input 
                placeholder="25" 
                value={data.influencerRequirements.maxParticipants}
                onChange={(e) => updateData('influencerRequirements', { maxParticipants: e.target.value })}
                className="h-10" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Application Deadline</label>
              <Input type="date" className="h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Account Health Requirements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">8. Account Health & Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="public_account"
                checked={data.influencerRequirements.accountHealth.publicAccount}
                onCheckedChange={(checked) => {
                  updateData('influencerRequirements', {
                    accountHealth: {
                      ...data.influencerRequirements.accountHealth,
                      publicAccount: !!checked
                    }
                  })
                }}
              />
              <label htmlFor="public_account" className="text-sm text-slate-700">
                Account must be public
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="verified_account"
                checked={data.influencerRequirements.accountHealth.verifiedAccount}
                onCheckedChange={(checked) => {
                  updateData('influencerRequirements', {
                    accountHealth: {
                      ...data.influencerRequirements.accountHealth,
                      verifiedAccount: !!checked
                    }
                  })
                }}
              />
              <label htmlFor="verified_account" className="text-sm text-slate-700">
                Prefer verified accounts
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="consistent_posting"
                checked={data.influencerRequirements.accountHealth.consistentPosting}
                onCheckedChange={(checked) => {
                  updateData('influencerRequirements', {
                    accountHealth: {
                      ...data.influencerRequirements.accountHealth,
                      consistentPosting: !!checked
                    }
                  })
                }}
              />
              <label htmlFor="consistent_posting" className="text-sm text-slate-700">
                Consistent posting behavior (min 3 posts/week)
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="no_fake_followers"
                checked={data.influencerRequirements.accountHealth.noFakeFollowers}
                onCheckedChange={(checked) => {
                  updateData('influencerRequirements', {
                    accountHealth: {
                      ...data.influencerRequirements.accountHealth,
                      noFakeFollowers: !!checked
                    }
                  })
                }}
              />
              <label htmlFor="no_fake_followers" className="text-sm text-slate-700">
                No suspicious follower spikes
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="authentic_engagement"
                checked={data.influencerRequirements.accountHealth.authenticEngagement}
                onCheckedChange={(checked) => {
                  updateData('influencerRequirements', {
                    accountHealth: {
                      ...data.influencerRequirements.accountHealth,
                      authenticEngagement: !!checked
                    }
                  })
                }}
              />
              <label htmlFor="authentic_engagement" className="text-sm text-slate-700">
                Authentic engagement (no bots)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="complete_profile"
                checked={data.influencerRequirements.accountHealth.completeProfile}
                onCheckedChange={(checked) => {
                  updateData('influencerRequirements', {
                    accountHealth: {
                      ...data.influencerRequirements.accountHealth,
                      completeProfile: !!checked
                    }
                  })
                }}
              />
              <label htmlFor="complete_profile" className="text-sm text-slate-700">
                Complete profile information
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Payment Verification */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">9. Contact & Payment Verification</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="verified_email"
                checked={data.influencerRequirements.verification.verifiedEmail}
                onCheckedChange={(checked) => {
                  updateData('influencerRequirements', {
                    verification: {
                      ...data.influencerRequirements.verification,
                      verifiedEmail: !!checked
                    }
                  })
                }}
              />
              <label htmlFor="verified_email" className="text-sm text-slate-700">
                Verified email address required
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="phone_verification"
                checked={data.influencerRequirements.verification.phoneVerification}
                onCheckedChange={(checked) => {
                  updateData('influencerRequirements', {
                    verification: {
                      ...data.influencerRequirements.verification,
                      phoneVerification: !!checked
                    }
                  })
                }}
              />
              <label htmlFor="phone_verification" className="text-sm text-slate-700">
                Phone number verification required
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="payment_details"
                checked={data.influencerRequirements.verification.paymentDetails}
                onCheckedChange={(checked) => {
                  updateData('influencerRequirements', {
                    verification: {
                      ...data.influencerRequirements.verification,
                      paymentDetails: !!checked
                    }
                  })
                }}
              />
              <label htmlFor="payment_details" className="text-sm text-slate-700">
                Valid payment details (Mpesa/Bank)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="tax_information"
                checked={data.influencerRequirements.verification.taxInformation}
                onCheckedChange={(checked) => {
                  updateData('influencerRequirements', {
                    verification: {
                      ...data.influencerRequirements.verification,
                      taxInformation: !!checked
                    }
                  })
                }}
              />
              <label htmlFor="tax_information" className="text-sm text-slate-700">
                Tax/business information (for high-value campaigns)
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Verification Requirements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">10. Platform Verification</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-2">OAuth Connection Required</h4>
              <p className="text-sm text-blue-800 mb-3">
                Influencers must connect their social accounts to verify follower counts, engagement metrics, and profile information.
              </p>
              <div className="space-y-2">
                {platforms.map((platform) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`oauth-${platform}`}
                      checked={data.influencerRequirements.platformVerification.includes(platform)}
                      onCheckedChange={(checked) => {
                        const newPlatformVerification = checked 
                          ? [...data.influencerRequirements.platformVerification, platform]
                          : data.influencerRequirements.platformVerification.filter(p => p !== platform)
                        updateData('influencerRequirements', { platformVerification: newPlatformVerification })
                      }}
                    />
                    <label htmlFor={`oauth-${platform}`} className="text-sm text-blue-800">
                      {platform} connection required
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ApprovalSettingsStep({ data, updateData }: { data: CampaignData, updateData: Function }) {
  const trustModes = [
    {
      value: 'strict',
      label: 'Strict Approval',
      description: 'All content must be reviewed and approved before posting',
      icon: '🔒'
    },
    {
      value: 'moderate',
      label: 'Moderate Trust',
      description: 'Trusted influencers can post directly, others need approval',
      icon: '⚖️'
    },
    {
      value: 'flexible',
      label: 'Flexible Trust',
      description: 'Influencers can post directly, just submit live links afterward',
      icon: '🚀'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Content Approval Settings</h2>
        <p className="text-slate-600">
          Configure how content is reviewed and approved for this campaign
        </p>
      </div>

      {/* Trust Mode Selection */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Content Review Approach</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {trustModes.map((mode) => (
            <div
              key={mode.value}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                data.approvalSettings.trustMode === mode.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => {
                updateData('approvalSettings', {
                  trustMode: mode.value,
                  requiresApproval: mode.value !== 'flexible'
                })
              }}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{mode.icon}</div>
                <h4 className="font-semibold text-slate-900 mb-2">{mode.label}</h4>
                <p className="text-sm text-slate-600">{mode.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Approval Requirements */}
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Approval Requirements</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="requires_approval"
                  checked={data.approvalSettings.requiresApproval}
                  onCheckedChange={(checked) => {
                    updateData('approvalSettings', { requiresApproval: !!checked })
                  }}
                />
                <div>
                  <label htmlFor="requires_approval" className="text-sm font-medium text-slate-700">
                    Content requires approval before posting
                  </label>
                  <p className="text-xs text-slate-500">
                    When enabled, all content must be reviewed and approved by your team
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Instructions */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Approval Instructions (Optional)
            </label>
            <textarea
              placeholder="Provide specific guidelines for content approval, brand voice requirements, or key messaging points..."
              value={data.approvalSettings.approvalInstructions}
              onChange={(e) => updateData('approvalSettings', { approvalInstructions: e.target.value })}
              className="w-full h-24 p-3 border border-slate-200 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={500}
            />
            <p className="text-xs text-slate-500 mt-1">
              {data.approvalSettings.approvalInstructions.length}/500 characters
            </p>
          </div>
        </div>

        {/* Trust & Performance */}
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-slate-900 mb-3">Performance Focus</h4>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-blue-500 mt-0.5">📊</div>
                <div>
                  <h5 className="font-medium text-blue-900 mb-2">Metrics-Driven Approach</h5>
                  <p className="text-sm text-blue-800 mb-3">
                    Regardless of approval settings, all influencers must submit live post URLs for performance tracking.
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Real-time engagement monitoring</li>
                    <li>• ROI calculations and reporting</li>
                    <li>• Performance-based payment triggers</li>
                    <li>• Campaign analytics dashboard</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-slate-900 mb-3">Content Workflow</h4>
            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <div className="text-sm text-slate-700">
                  <strong>Step 1:</strong> Influencer creates content
                  {data.approvalSettings.requiresApproval ? (
                    <>
                      <br /><strong>Step 2:</strong> Brand reviews and approves content
                      <br /><strong>Step 3:</strong> Influencer posts on social media
                      <br /><strong>Step 4:</strong> Influencer submits live post URLs
                      <br /><strong>Step 5:</strong> Performance tracking begins
                    </>
                  ) : (
                    <>
                      <br /><strong>Step 2:</strong> Influencer posts on social media
                      <br /><strong>Step 3:</strong> Influencer submits live post URLs
                      <br /><strong>Step 4:</strong> Performance tracking begins
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-900 mb-2">Campaign Ready</h4>
            <p className="text-sm text-green-800">
              {data.approvalSettings.requiresApproval 
                ? 'Your campaign is configured with content approval requirements. Influencers will submit content for review before posting.'
                : 'Your campaign is configured for direct posting. Influencers can post immediately and submit live URLs for tracking.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
