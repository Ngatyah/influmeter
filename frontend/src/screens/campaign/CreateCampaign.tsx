import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Checkbox } from '../../components/ui/checkbox'

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
  }
  influencerRequirements: {
    minFollowers: string
    maxFollowers: string
    engagementRate: string
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
  }
}

const steps = [
  { id: 1, title: 'Campaign Details', icon: Target },
  { id: 2, title: 'Target Audience', icon: Users },
  { id: 3, title: 'Budget & Timeline', icon: DollarSign },
  { id: 4, title: 'Content Brief', icon: FileText },
  { id: 5, title: 'Influencer Requirements', icon: Settings },
]

export default function CreateCampaign() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
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
      files: []
    },
    influencerRequirements: {
      minFollowers: '',
      maxFollowers: '',
      engagementRate: '',
      niches: [],
      location: [],
      platformFollowers: {},
      pastPerformance: {
        conversionRate: '',
        completionRate: '',
        requireExperience: false,
        requireReferralCodes: false,
        requireClickTracking: false
      }
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

  const saveDraft = () => {
    // Save campaign as draft
    console.log('Saving draft:', campaignData)
  }

  const launchCampaign = () => {
    // Launch campaign
    console.log('Launching campaign:', campaignData)
    navigate('/dashboard/brand')
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
              <h1 className="text-2xl font-semibold text-slate-900">Create Campaign</h1>
              <p className="text-slate-600">Step {currentStep} of {steps.length}</p>
            </div>
          </div>
          <Button variant="outline" onClick={saveDraft}>
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
        </div>
      </header>

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
                />
              )}
              {currentStep === 5 && (
                <InfluencerRequirementsStep 
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
                    <Button onClick={launchCampaign} className="bg-primary hover:bg-primary/90">
                      <Send className="w-4 h-4 mr-2" />
                      Launch Campaign
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

function ContentBriefStep({ data, updateData }: { data: CampaignData, updateData: Function }) {
  const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Facebook']
  const contentRequirements = [
    'Include brand hashtag',
    'Tag brand account',
    'Show product clearly',
    'Include call-to-action',
    'Use provided copy',
    'Include disclaimer'
  ]

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
        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center">
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600">Drag and drop files or click to browse</p>
          <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF up to 10MB</p>
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
              <Checkbox id="require_past_campaigns" />
              <label htmlFor="require_past_campaigns" className="text-sm text-slate-700">
                Require previous campaign experience
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="require_referral_codes" />
              <label htmlFor="require_referral_codes" className="text-sm text-slate-700">
                Must have used referral/promo codes before
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="require_click_tracking" />
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
            <Checkbox id="location_specific" />
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
                  <Checkbox id={`content-${type}`} />
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
              <Checkbox id="require_high_quality" />
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
              <Checkbox id="manual_approval" />
              <label htmlFor="manual_approval" className="text-sm text-slate-700">
                Manual approval required for high-value campaigns
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Maximum Participants</label>
              <Input placeholder="25" className="h-10" />
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
              <Checkbox id="public_account" defaultChecked />
              <label htmlFor="public_account" className="text-sm text-slate-700">
                Account must be public
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="verified_account" />
              <label htmlFor="verified_account" className="text-sm text-slate-700">
                Prefer verified accounts
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="consistent_posting" defaultChecked />
              <label htmlFor="consistent_posting" className="text-sm text-slate-700">
                Consistent posting behavior (min 3 posts/week)
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="no_fake_followers" defaultChecked />
              <label htmlFor="no_fake_followers" className="text-sm text-slate-700">
                No suspicious follower spikes
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="authentic_engagement" defaultChecked />
              <label htmlFor="authentic_engagement" className="text-sm text-slate-700">
                Authentic engagement (no bots)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="complete_profile" defaultChecked />
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
              <Checkbox id="verified_email" defaultChecked />
              <label htmlFor="verified_email" className="text-sm text-slate-700">
                Verified email address required
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="phone_verification" />
              <label htmlFor="phone_verification" className="text-sm text-slate-700">
                Phone number verification required
              </label>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="payment_details" defaultChecked />
              <label htmlFor="payment_details" className="text-sm text-slate-700">
                Valid payment details (Mpesa/Bank)
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="tax_information" />
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
                    <Checkbox id={`oauth-${platform}`} defaultChecked />
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
