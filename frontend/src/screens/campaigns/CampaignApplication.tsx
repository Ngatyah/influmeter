import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Link,
  MessageSquare,
  Star,
  Calendar,
  DollarSign,
  Users,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Checkbox } from '../../components/ui/checkbox'
import { campaignService, Campaign } from '../../services/campaign.service'
import { formatSafeDate } from '../../utils/dateUtils'

interface ApplicationData {
  motivation: string
  contentIdeas: string
  proposedTimeline: string
  portfolioLinks: string[]
  agreedToTerms: boolean
  agreedToExclusivity: boolean
  agreedToDeadlines: boolean
}

export default function CampaignApplication() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  
  const [applicationData, setApplicationData] = useState<ApplicationData>({
    motivation: '',
    contentIdeas: '',
    proposedTimeline: '',
    portfolioLinks: [''],
    agreedToTerms: false,
    agreedToExclusivity: false,
    agreedToDeadlines: false
  })

  // Load campaign data
  useEffect(() => {
    if (id) {
      loadCampaignData()
    }
  }, [id])

  const loadCampaignData = async () => {
    try {
      setLoading(true)
      setError(null)
      const campaignData = await campaignService.getCampaign(id!)
      setCampaign(campaignData)
    } catch (error) {
      console.error('Failed to load campaign:', error)
      setError(error instanceof Error ? error.message : 'Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  // Mock campaign data for fallback - replace with API call
  const mockCampaign = {
    id,
    title: 'Summer Skincare Collection Launch',
    brand: {
      name: 'NIVEA Kenya',
      logo: '/api/placeholder/60/60',
      verified: true
    },
    payout: '$250-500',
    deadline: '2024-05-15',
    estimatedHours: '2-3 hours',
    participantsCount: 12,
    maxParticipants: 20,
    requirements: {
      minFollowers: '10,000+',
      platforms: ['Instagram', 'TikTok'],
      contentType: ['Reels', 'Stories', 'Static Posts']
    }
  }

  const handleInputChange = (field: keyof ApplicationData, value: string | boolean) => {
    setApplicationData(prev => ({ ...prev, [field]: value }))
  }

  const handlePortfolioLinkChange = (index: number, value: string) => {
    const newLinks = [...applicationData.portfolioLinks]
    newLinks[index] = value
    setApplicationData(prev => ({ ...prev, portfolioLinks: newLinks }))
  }

  const addPortfolioLink = () => {
    setApplicationData(prev => ({
      ...prev,
      portfolioLinks: [...prev.portfolioLinks, '']
    }))
  }

  const removePortfolioLink = (index: number) => {
    const newLinks = applicationData.portfolioLinks.filter((_, i) => i !== index)
    setApplicationData(prev => ({ ...prev, portfolioLinks: newLinks }))
  }

  const isFormValid = () => {
    return (
      applicationData.motivation.trim() !== '' &&
      applicationData.contentIdeas.trim() !== '' &&
      applicationData.agreedToTerms &&
      applicationData.agreedToExclusivity &&
      applicationData.agreedToDeadlines
    )
  }

  const handleSubmit = async () => {
    if (!isFormValid() || !id) return
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Prepare application data for API
      const apiApplicationData = {
        message: applicationData.motivation,
        proposedDeliverables: [
          applicationData.contentIdeas,
          applicationData.proposedTimeline
        ].filter(Boolean),
        applicationData: {
          motivation: applicationData.motivation,
          contentIdeas: applicationData.contentIdeas,
          proposedTimeline: applicationData.proposedTimeline,
          portfolioLinks: applicationData.portfolioLinks.filter(link => link.trim() !== ''),
          agreedToTerms: applicationData.agreedToTerms,
          agreedToExclusivity: applicationData.agreedToExclusivity,
          agreedToDeadlines: applicationData.agreedToDeadlines
        }
      }
      
      // Submit application via API
      await campaignService.applyToCampaign(id, apiApplicationData)
      
      setIsSubmitting(false)
      setShowSuccess(true)
      
      // Redirect after 3 seconds to campaign details (so user sees updated status)
      setTimeout(() => {
        navigate(`/campaigns/${id}/details`)
      }, 3000)
      
    } catch (error) {
      console.error('Failed to submit application:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit application')
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading campaign details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Campaign Not Found</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <Button onClick={() => navigate('/campaigns/browse')}>
            Back to Campaigns
          </Button>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return <SuccessScreen campaign={campaign || mockCampaign} />
  }

  // Use real campaign data or fallback to mock
  const displayCampaign = campaign || mockCampaign

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/campaigns/${id}/details`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaign
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Apply to Campaign</h1>
              <p className="text-slate-600">{displayCampaign.title}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="max-w-4xl mx-auto px-6 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-700"
              >
                ×
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Application Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Application Guidelines */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Application Guidelines</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Please provide detailed and authentic responses. Quality applications have higher acceptance rates.
                    </p>
                  </div>
                </div>
                <ul className="text-sm text-slate-600 space-y-1 ml-8">
                  <li>• Be specific about your content creation approach</li>
                  <li>• Include relevant portfolio examples</li>
                  <li>• Show understanding of the brand and campaign objectives</li>
                  <li>• Propose realistic timelines for content delivery</li>
                </ul>
              </CardContent>
            </Card>

            {/* Application Form */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Motivation */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Why do you want to join this campaign? *
                  </label>
                  <textarea
                    placeholder="Share your motivation, connection to the brand, and why you're excited about this opportunity..."
                    value={applicationData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    className="w-full h-32 p-3 border border-slate-200 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={500}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {applicationData.motivation.length}/500 characters
                  </p>
                </div>

                {/* Content Ideas */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Content Creation Approach *
                  </label>
                  <textarea
                    placeholder="Describe your content ideas, shooting style, key messages you'll focus on, and how you'll showcase the products..."
                    value={applicationData.contentIdeas}
                    onChange={(e) => handleInputChange('contentIdeas', e.target.value)}
                    className="w-full h-32 p-3 border border-slate-200 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={800}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {applicationData.contentIdeas.length}/800 characters
                  </p>
                </div>

                {/* Timeline */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Proposed Content Timeline
                  </label>
                  <textarea
                    placeholder="When can you start? How will you schedule content creation and posting? (Optional but recommended)"
                    value={applicationData.proposedTimeline}
                    onChange={(e) => handleInputChange('proposedTimeline', e.target.value)}
                    className="w-full h-24 p-3 border border-slate-200 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={300}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {applicationData.proposedTimeline.length}/300 characters
                  </p>
                </div>

                {/* Portfolio Links */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Portfolio Examples
                  </label>
                  <p className="text-sm text-slate-600 mb-3">
                    Share links to your best content related to this campaign
                  </p>
                  {applicationData.portfolioLinks.map((link, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <Link className="w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="https://instagram.com/p/example or https://tiktok.com/@user/video/123"
                        value={link}
                        onChange={(e) => handlePortfolioLinkChange(index, e.target.value)}
                        className="flex-1"
                      />
                      {applicationData.portfolioLinks.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePortfolioLink(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  {applicationData.portfolioLinks.length < 5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addPortfolioLink}
                      className="mt-2"
                    >
                      + Add Another Link
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Terms and Agreements */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Terms & Agreements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Important Requirements</h4>
                  <p className="text-sm text-yellow-700">
                    Please read and accept all terms before submitting your application.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={applicationData.agreedToTerms}
                      onCheckedChange={(checked) => handleInputChange('agreedToTerms', !!checked)}
                    />
                    <div>
                      <label htmlFor="terms" className="text-sm font-medium text-slate-900">
                        I agree to the campaign terms and conditions *
                      </label>
                      <p className="text-xs text-slate-600 mt-1">
                        Including content guidelines, payment terms, and brand usage rights
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="exclusivity"
                      checked={applicationData.agreedToExclusivity}
                      onCheckedChange={(checked) => handleInputChange('agreedToExclusivity', !!checked)}
                    />
                    <div>
                      <label htmlFor="exclusivity" className="text-sm font-medium text-slate-900">
                        I agree to the 30-day exclusivity period for skincare brands *
                      </label>
                      <p className="text-xs text-slate-600 mt-1">
                        No competing skincare brand collaborations during this period
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="deadlines"
                      checked={applicationData.agreedToDeadlines}
                      onCheckedChange={(checked) => handleInputChange('agreedToDeadlines', !!checked)}
                    />
                    <div>
                      <label htmlFor="deadlines" className="text-sm font-medium text-slate-900">
                        I commit to meeting all content delivery deadlines *
                      </label>
                      <p className="text-xs text-slate-600 mt-1">
                        Late submissions may result in campaign removal and payment forfeiture
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate(`/campaigns/${id}/details`)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Application'
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Campaign Summary */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={displayCampaign.brand?.brandProfile?.logoUrl || displayCampaign.brand?.logo || '/api/placeholder/60/60'} 
                    alt={displayCampaign.brand?.brandProfile?.companyName || displayCampaign.brand?.name || 'Brand'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-1">
                      <h3 className="font-semibold text-slate-900">
                        {displayCampaign.brand?.brandProfile?.companyName || 
                         displayCampaign.brand?.name ||
                         `${displayCampaign.brand?.profile?.firstName || ''} ${displayCampaign.brand?.profile?.lastName || ''}`.trim() ||
                         'Brand'}
                      </h3>
                      {displayCampaign.brand?.verified && <Star className="w-4 h-4 text-yellow-500" />}
                    </div>
                    <p className="text-sm text-slate-600">{displayCampaign.title}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-600">Payout</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      {displayCampaign.budget ? `$${displayCampaign.budget}` : displayCampaign.payout || 'TBD'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span className="text-sm text-slate-600">Deadline</span>
                    </div>
                    <span className="text-sm text-slate-900">
                      {displayCampaign.endDate ? 
                        formatSafeDate(displayCampaign.endDate) : 
                        displayCampaign.deadline ? 
                          formatSafeDate(displayCampaign.deadline) : 
                          'Not set'
                      }
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-slate-600">Spots</span>
                    </div>
                    <span className="text-sm text-slate-900">
                      {displayCampaign.participantsCount || 0}/{displayCampaign.maxParticipants || displayCampaign.influencersNeeded || '∞'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requirements Reminder */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {displayCampaign.requirements?.minFollowers && (
                  <div>
                    <span className="text-sm text-slate-600">Min Followers:</span>
                    <Badge className="ml-2">{displayCampaign.requirements.minFollowers}</Badge>
                  </div>
                )}
                
                {displayCampaign.requirements?.platforms && (
                  <div>
                    <span className="text-sm text-slate-600">Platforms:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {displayCampaign.requirements.platforms.map((platform) => (
                        <Badge key={platform} variant="secondary" className="text-xs">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {displayCampaign.requirements?.contentType && (
                  <div>
                    <span className="text-sm text-slate-600">Content Types:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {displayCampaign.requirements.contentType.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback for mock data or incomplete requirements */}
                {!displayCampaign.requirements && (
                  <p className="text-sm text-slate-500">No specific requirements listed</p>
                )}
              </CardContent>
            </Card>

            {/* Application Tips */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">💡 Application Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• Be authentic and show genuine interest</li>
                  <li>• Include specific content ideas</li>
                  <li>• Share relevant portfolio examples</li>
                  <li>• Demonstrate brand knowledge</li>
                  <li>• Propose realistic timelines</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function SuccessScreen({ campaign }: { campaign: Campaign }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm max-w-md w-full mx-6">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-2">Application Submitted!</h2>
          <p className="text-slate-600 mb-6">
            Your application for "{campaign.title}" has been sent to {
              campaign?.brand?.brandProfile?.companyName || 
              `${campaign?.brand?.profile?.firstName || ''} ${campaign?.brand?.profile?.lastName || ''}`.trim() || 
              'the brand'
            }. 
            You'll receive a notification within 2-3 business days.
          </p>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/campaigns/browse')}
              className="w-full"
            >
              Browse More Campaigns
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/dashboard/influencer')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
