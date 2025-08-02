import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowRight,
  Check,
  Instagram,
  Youtube,
  Twitter,
  Globe,
  MapPin,
  User,
  Calendar,
  Camera,
  Star,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'

const TOTAL_STEPS = 4

export default function InfluencerOnboarding() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    fullName: '',
    bio: '',
    location: '',
    dateOfBirth: '',
    gender: '',
    
    // Step 2: Categories & Niches
    primaryCategory: '',
    niches: [] as string[],
    languages: [] as string[],
    
    // Step 3: Social Media
    socialAccounts: {
      instagram: { username: '', followers: 0, connected: false },
      tiktok: { username: '', followers: 0, connected: false },
      youtube: { username: '', followers: 0, connected: false },
      twitter: { username: '', followers: 0, connected: false }
    },
    
    // Step 4: Content & Preferences
    contentTypes: [] as string[],
    rates: {
      instagramPost: 0,
      instagramStory: 0,
      tiktokVideo: 0,
      youtubeIntegration: 0
    },
    collaborationPreferences: [] as string[]
  })

  const categories = [
    'Lifestyle', 'Fashion', 'Beauty', 'Tech', 'Gaming', 'Fitness',
    'Food & Cooking', 'Travel', 'Parenting', 'Business', 'Education', 'Entertainment'
  ]

  const niches = [
    'Skincare', 'Makeup', 'Street Style', 'Luxury Fashion', 'Fitness Gear',
    'Mobile Phones', 'Gaming Hardware', 'Healthy Eating', 'Adventure Travel',
    'Photography', 'Music', 'Comedy', 'DIY', 'Sustainability'
  ]

  const languages = ['English', 'Swahili', 'French', 'Arabic', 'Spanish', 'Portuguese']

  const contentTypes = [
    'Instagram Posts', 'Instagram Stories', 'Instagram Reels',
    'TikTok Videos', 'YouTube Videos', 'YouTube Shorts',
    'Twitter Posts', 'Product Reviews', 'Unboxing Videos',
    'Tutorials', 'Live Streams'
  ]

  const collaborationPrefs = [
    'Long-term partnerships', 'One-time campaigns', 'Product gifting',
    'Paid collaborations only', 'Brand ambassadorships', 'Event partnerships'
  ]

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCompletedSteps([...completedSteps, currentStep])
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    // Save onboarding data
    console.log('Onboarding completed:', formData)
    
    // Update user onboarding status in Redux/API
    // dispatch(updateUserProfile({ ...formData, onboardingCompleted: true }))
    
    // Redirect to dashboard
    navigate('/dashboard/influencer')
  }

  const connectSocialAccount = (platform: string) => {
    // Simulate OAuth connection
    const followers = Math.floor(Math.random() * 50000) + 1000
    setFormData({
      ...formData,
      socialAccounts: {
        ...formData.socialAccounts,
        [platform]: {
          ...formData.socialAccounts[platform as keyof typeof formData.socialAccounts],
          connected: true,
          followers
        }
      }
    })
  }

  const toggleSelection = (array: string[], item: string, setter: (value: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item))
    } else {
      setter([...array, item])
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-slate-900">Complete Your Profile</h1>
            <span className="text-sm text-slate-600">Step {currentStep} of {TOTAL_STEPS}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="flex space-x-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i + 1 <= currentStep
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <User className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-900">Personal Information</h2>
                  <p className="text-slate-600">Tell us about yourself</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Full Name *
                    </label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Location *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="City, Country"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Date of Birth *
                    </label>
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full p-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bio *
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell us about yourself and what makes you unique..."
                    className="w-full h-24 p-3 border border-slate-200 rounded-md resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={500}
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">{formData.bio.length}/500 characters</p>
                </div>
              </div>
            )}

            {/* Step 2: Categories & Niches */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Star className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-900">Your Expertise</h2>
                  <p className="text-slate-600">What do you create content about?</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Primary Category *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setFormData({...formData, primaryCategory: category})}
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          formData.primaryCategory === category
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Niches (Select up to 5)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {niches.map((niche) => (
                      <button
                        key={niche}
                        onClick={() => {
                          if (formData.niches.length < 5 || formData.niches.includes(niche)) {
                            toggleSelection(formData.niches, niche, (newNiches) =>
                              setFormData({...formData, niches: newNiches})
                            )
                          }
                        }}
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          formData.niches.includes(niche)
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-slate-200 hover:border-slate-300'
                        } ${formData.niches.length >= 5 && !formData.niches.includes(niche) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {niche}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Selected: {formData.niches.length}/5</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Languages you create content in
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {languages.map((language) => (
                      <button
                        key={language}
                        onClick={() =>
                          toggleSelection(formData.languages, language, (newLanguages) =>
                            setFormData({...formData, languages: newLanguages})
                          )
                        }
                        className={`px-4 py-2 text-sm rounded-full border transition-all ${
                          formData.languages.includes(language)
                            ? 'border-purple-500 bg-purple-500 text-white'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Social Media Accounts */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Camera className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-900">Connect Your Accounts</h2>
                  <p className="text-slate-600">Link your social media accounts to verify your audience</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { key: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500' },
                    { key: 'tiktok', name: 'TikTok', icon: Globe, color: 'text-black' },
                    { key: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500' },
                    { key: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'text-blue-500' }
                  ].map((platform) => {
                    const account = formData.socialAccounts[platform.key as keyof typeof formData.socialAccounts]
                    const Icon = platform.icon

                    return (
                      <Card key={platform.key} className="border-2 hover:border-purple-200 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <Icon className={`w-6 h-6 ${platform.color}`} />
                              <span className="font-medium">{platform.name}</span>
                            </div>
                            {account.connected && (
                              <Badge className="bg-green-100 text-green-800">
                                <Check className="w-3 h-3 mr-1" />
                                Connected
                              </Badge>
                            )}
                          </div>

                          {account.connected ? (
                            <div className="space-y-2">
                              <p className="text-sm text-slate-600">@{account.username}</p>
                              <p className="text-sm font-semibold">{account.followers.toLocaleString()} followers</p>
                              <Button variant="outline" size="sm" className="w-full">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View Profile
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <Input
                                placeholder={`Your ${platform.name} username`}
                                value={account.username}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  socialAccounts: {
                                    ...formData.socialAccounts,
                                    [platform.key]: { ...account, username: e.target.value }
                                  }
                                })}
                              />
                              <Button
                                onClick={() => connectSocialAccount(platform.key)}
                                className="w-full"
                                disabled={!account.username}
                              >
                                Connect {platform.name}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Why connect your accounts?</strong> This helps us verify your audience and recommend relevant campaigns. Your account data is kept secure and private.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Content & Rates */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <Camera className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-slate-900">Content & Collaboration</h2>
                  <p className="text-slate-600">Set your preferences and starting rates</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Content Types You Create
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {contentTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() =>
                          toggleSelection(formData.contentTypes, type, (newTypes) =>
                            setFormData({...formData, contentTypes: newTypes})
                          )
                        }
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          formData.contentTypes.includes(type)
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
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
                    Starting Rates (USD) - You can adjust these later
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Instagram Post</label>
                      <Input
                        type="number"
                        value={formData.rates.instagramPost}
                        onChange={(e) => setFormData({
                          ...formData,
                          rates: { ...formData.rates, instagramPost: Number(e.target.value) }
                        })}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">Instagram Story</label>
                      <Input
                        type="number"
                        value={formData.rates.instagramStory}
                        onChange={(e) => setFormData({
                          ...formData,
                          rates: { ...formData.rates, instagramStory: Number(e.target.value) }
                        })}
                        placeholder="50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">TikTok Video</label>
                      <Input
                        type="number"
                        value={formData.rates.tiktokVideo}
                        onChange={(e) => setFormData({
                          ...formData,
                          rates: { ...formData.rates, tiktokVideo: Number(e.target.value) }
                        })}
                        placeholder="80"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 mb-1">YouTube Integration</label>
                      <Input
                        type="number"
                        value={formData.rates.youtubeIntegration}
                        onChange={(e) => setFormData({
                          ...formData,
                          rates: { ...formData.rates, youtubeIntegration: Number(e.target.value) }
                        })}
                        placeholder="300"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Collaboration Preferences
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {collaborationPrefs.map((pref) => (
                      <button
                        key={pref}
                        onClick={() =>
                          toggleSelection(formData.collaborationPreferences, pref, (newPrefs) =>
                            setFormData({...formData, collaborationPreferences: newPrefs})
                          )
                        }
                        className={`p-3 text-sm rounded-lg border transition-all ${
                          formData.collaborationPreferences.includes(pref)
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {pref}
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
                <Button variant="outline" onClick={() => navigate('/dashboard/influencer')}>
                  Skip for now
                </Button>
                <Button onClick={handleNext}>
                  {currentStep === TOTAL_STEPS ? 'Complete Setup' : 'Continue'}
                  {currentStep < TOTAL_STEPS && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
