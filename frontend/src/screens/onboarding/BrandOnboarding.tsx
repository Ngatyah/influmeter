import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowRight,
  Building,
  Upload,
  Target,
  DollarSign,
  Globe,
  Users,
  Camera
} from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { onboardingService, BrandCompanyData, BrandGoalsData, BrandPreferencesData } from '../../services/onboarding.service'

const TOTAL_STEPS = 3

export default function BrandOnboarding() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Company Information
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    description: '',
    logo: null as File | null,
    contactName: '',

    // Step 2: Marketing Goals
    marketingGoals: [] as string[],
    targetAudience: {
      ageRange: '',
      gender: '',
      location: '',
      interests: [] as string[]
    },
    campaignTypes: [] as string[],
    
    // Step 3: Budget & Preferences
    monthlyBudget: '',
    preferredPlatforms: [] as string[],
    influencerTypes: [] as string[],
    collaborationStyle: ''
  })

  const industries = [
    'Fashion & Beauty', 'Technology', 'Food & Beverage', 'Health & Fitness',
    'Travel & Tourism', 'Automotive', 'Finance', 'Education', 'Entertainment',
    'Home & Garden', 'Sports', 'Gaming', 'Other'
  ]

  const companySizes = ['1-10', '11-50', '51-200', '201-1000', '1000+']

  const marketingGoals = [
    'Brand Awareness', 'Product Launch', 'Sales Growth', 'Community Building',
    'Lead Generation', 'Website Traffic', 'Social Media Growth', 'Customer Engagement'
  ]

  const campaignTypes = [
    'Product Reviews', 'Unboxing Videos', 'Tutorials', 'Lifestyle Content',
    'Event Coverage', 'Brand Ambassadorships', 'User Generated Content', 'Giveaways'
  ]

  const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter', 'LinkedIn', 'Facebook']

  const influencerTypes = [
    'Nano (1K-10K)', 'Micro (10K-100K)', 'Mid-tier (100K-1M)', 
    'Macro (1M+)', 'Celebrities', 'Industry Experts'
  ]

  const budgetRanges = [
    'Under $1,000', '$1,000 - $5,000', '$5,000 - $10,000', 
    '$10,000 - $25,000', '$25,000 - $50,000', '$50,000+'
  ]

  const handleNext = async () => {
    setLoading(true)
    setError('')

    try {
      switch (currentStep) {
        case 1:
          // TODO: Implement proper file upload for logo
          // For now, we'll save company info without logo URL since blob URLs won't persist
          await onboardingService.saveBrandCompany({
            companyName: formData.companyName,
            industry: formData.industry,
            companySize: formData.companySize,
            description: formData.description,
            contactName: formData.contactName,
            logoUrl: '' // Will be implemented with proper file upload service
          })
          break

        case 2:
          await onboardingService.saveBrandGoals({
            objectives: formData.marketingGoals,
            campaignTypes: formData.campaignTypes,
            targetAudience: formData.targetAudience
          })
          break

        case 3:
          await onboardingService.saveBrandPreferences({
            budgetRange: formData.monthlyBudget,
            platforms: formData.preferredPlatforms,
            influencerTypes: formData.influencerTypes,
            collaborationStyle: formData.collaborationStyle
          })
          // Onboarding complete, redirect to dashboard
          navigate('/dashboard/brand')
          return
      }

      setCurrentStep(prev => prev + 1)
    } catch (err: any) {
      setError(err.message || 'Failed to save data')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleSelection = (array: string[], item: string, setter: (value: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setFormData({...formData, logo: file})
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Set Up Your Brand</h1>
            <span className="text-sm text-slate-600">Step {currentStep} of {TOTAL_STEPS}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="flex space-x-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i + 1 <= currentStep
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Building className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-900">Company Information</h2>
                  <p className="text-slate-600">Tell us about your brand</p>
                </div>

                {/* Logo Upload */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer">
                      {formData.logo ? (
                        <img 
                          src={URL.createObjectURL(formData.logo)} 
                          alt="Logo" 
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <Upload className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <p className="text-center text-sm text-slate-600 -mt-4">Upload your company logo</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Name *
                    </label>
                    <Input
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      placeholder="Your company name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Website
                    </label>
                    <Input
                      value={formData.website}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      placeholder="https://yourcompany.com"
                      type="url"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Industry *
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({...formData, industry: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select industry</option>
                      {industries.map((industry) => (
                        <option key={industry} value={industry}>{industry}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Company Size
                    </label>
                    <select
                      value={formData.companySize}
                      onChange={(e) => setFormData({...formData, companySize: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select company size</option>
                      {companySizes.map((size) => (
                        <option key={size} value={size}>{size} employees</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Company Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe your company, products, and what makes you unique..."
                    className="w-full h-24 p-3 border border-slate-200 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={500}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">{formData.description.length}/500 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contact Person Name *
                  </label>
                  <Input
                    value={formData.contactName}
                    onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                    placeholder="Name of the person we can contact at your company"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Marketing Goals */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Target className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-900">Marketing Goals</h2>
                  <p className="text-slate-600">What do you want to achieve?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Marketing Goals (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {marketingGoals.map((goal) => (
                      <button
                        key={goal}
                        onClick={() =>
                          toggleSelection(formData.marketingGoals, goal, (newGoals) =>
                            setFormData({...formData, marketingGoals: newGoals})
                          )
                        }
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          formData.marketingGoals.includes(goal)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Campaign Types You're Interested In
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {campaignTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          toggleSelection(formData.campaignTypes, type, (newTypes) =>
                            setFormData({...formData, campaignTypes: newTypes})
                          )
                        }
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          formData.campaignTypes.includes(type)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Target Age Range
                    </label>
                    <select
                      value={formData.targetAudience.ageRange}
                      onChange={(e) => setFormData({
                        ...formData,
                        targetAudience: {...formData.targetAudience, ageRange: e.target.value}
                      })}
                      className="w-full p-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select age range</option>
                      <option value="13-17">13-17</option>
                      <option value="18-24">18-24</option>
                      <option value="25-34">25-34</option>
                      <option value="35-44">35-44</option>
                      <option value="45-54">45-54</option>
                      <option value="55+">55+</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Target Gender
                    </label>
                    <select
                      value={formData.targetAudience.gender}
                      onChange={(e) => setFormData({
                        ...formData,
                        targetAudience: {...formData.targetAudience, gender: e.target.value}
                      })}
                      className="w-full p-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Any gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="all">All genders</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Target Location
                  </label>
                  <Input
                    value={formData.targetAudience.location}
                    onChange={(e) => setFormData({
                      ...formData,
                      targetAudience: {...formData.targetAudience, location: e.target.value}
                    })}
                    placeholder="e.g., Kenya, East Africa, Global"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Budget & Preferences */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <DollarSign className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-900">Budget & Preferences</h2>
                  <p className="text-slate-600">Set your collaboration preferences</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Monthly Marketing Budget
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {budgetRanges.map((range) => (
                      <button
                        key={range}
                        onClick={() => setFormData({...formData, monthlyBudget: range})}
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          formData.monthlyBudget === range
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {range}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Preferred Platforms
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {platforms.map((platform) => (
                      <button
                        key={platform}
                        onClick={() =>
                          toggleSelection(formData.preferredPlatforms, platform, (newPlatforms) =>
                            setFormData({...formData, preferredPlatforms: newPlatforms})
                          )
                        }
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          formData.preferredPlatforms.includes(platform)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Influencer Types You Want to Work With
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {influencerTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          toggleSelection(formData.influencerTypes, type, (newTypes) =>
                            setFormData({...formData, influencerTypes: newTypes})
                          )
                        }
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          formData.influencerTypes.includes(type)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Collaboration Style
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'hands-on', label: 'Hands-on', desc: 'I want to be closely involved in content creation' },
                      { value: 'collaborative', label: 'Collaborative', desc: 'I want to provide guidance but give creative freedom' },
                      { value: 'hands-off', label: 'Hands-off', desc: 'I trust influencers to create authentic content' }
                    ].map((style) => (
                      <button
                        key={style.value}
                        onClick={() => setFormData({...formData, collaborationStyle: style.value})}
                        className={`w-full p-4 text-left rounded-lg border transition-all ${
                          formData.collaborationStyle === style.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="font-medium text-slate-900">{style.label}</div>
                        <div className="text-sm text-slate-600 mt-1">{style.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-200">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => navigate('/dashboard/brand')}>
                  Skip for now
                </Button>
                <Button onClick={handleNext} disabled={loading}>
                  {currentStep === TOTAL_STEPS ? 'Complete Setup' : 'Continue'}
                  {currentStep < TOTAL_STEPS && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
