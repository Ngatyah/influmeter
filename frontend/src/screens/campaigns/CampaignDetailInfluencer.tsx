import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  MapPin,
  Star,
  Heart,
  CheckCircle,
  AlertCircle,
  FileText,
  Camera,
  Share2,
  Download,
  ExternalLink,
  Info
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

export default function CampaignDetailInfluencer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Mock campaign data - replace with API call
  const campaign = {
    id,
    title: 'Summer Skincare Collection Launch',
    brand: {
      name: 'NIVEA Kenya',
      logo: '/api/placeholder/80/80',
      verified: true,
      description: 'Leading skincare brand in East Africa, committed to natural beauty solutions.',
      website: 'https://nivea.co.ke'
    },
    description: 'We are launching our new summer skincare collection and looking for authentic content creators to showcase our products. This campaign focuses on natural beauty and the importance of proper skincare during sunny months.',
    fullBrief: `
      **Campaign Objective:**
      Promote NIVEA's new summer skincare collection targeting young adults aged 18-35 in Kenya and Tanzania.

      **Key Messages:**
      - Natural protection for African skin
      - Suitable for all skin types
      - Affordable luxury skincare
      - Local ingredients, global quality

      **Content Guidelines:**
      - Show authentic daily skincare routines
      - Highlight product benefits naturally
      - Include before/after if possible
      - Maintain positive, uplifting tone
      - Tag @niveakenya in all posts

      **Deliverables:**
      - 2x Instagram Reels (15-30 seconds each)
      - 4x Instagram Stories
      - 1x Static feed post
      - Must use hashtags: #NIVEASummer #NaturalGlow #SkincareRoutine
    `,
    payout: '$250-500',
    payoutDetails: {
      baseAmount: '$250',
      bonusOpportunities: 'Up to $250 bonus for exceptional performance (views, engagement, conversions)',
      paymentTerms: 'Payment within 14 days of content approval'
    },
    deadline: '2024-05-15',
    timeline: {
      applicationDeadline: '2024-04-20',
      contentSubmissionDeadline: '2024-05-10',
      campaignEnd: '2024-05-15'
    },
    requirements: {
      minFollowers: '10,000+',
      platforms: ['Instagram', 'TikTok'],
      contentType: ['Reels', 'Stories', 'Static Posts'],
      niches: ['Beauty', 'Lifestyle', 'Skincare'],
      demographics: 'Female-focused content preferred',
      location: ['Kenya', 'Tanzania']
    },
    location: ['Kenya', 'Tanzania'],
    participantsCount: 12,
    maxParticipants: 20,
    status: 'open',
    difficulty: 'easy',
    estimatedHours: '2-3 hours',
    hasApplied: false,
    terms: {
      exclusivity: '30 days exclusivity for skincare brands',
      usage: 'Brand may repost content with credit',
      deliverables: 'All content must be submitted within deadline',
      revisions: 'Up to 2 revision requests may be made'
    },
    brandAssets: [
      { name: 'Brand Guidelines.pdf', size: '2.1 MB' },
      { name: 'Product Images.zip', size: '15.3 MB' },
      { name: 'Logo Pack.zip', size: '5.2 MB' }
    ]
  }

  const handleApply = () => {
    navigate(`/campaigns/${id}/apply`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/campaigns/browse')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={isBookmarked ? 'text-red-500' : 'text-slate-400'}
            >
              <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Campaign Header */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-6">
                  <img 
                    src={campaign.brand.logo} 
                    alt={campaign.brand.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-slate-900">{campaign.brand.name}</h3>
                      {campaign.brand.verified && <Star className="w-5 h-5 text-yellow-500" />}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{campaign.brand.description}</p>
                    <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-auto">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Visit Website
                    </Button>
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-4">{campaign.title}</h1>
                <p className="text-slate-600 mb-6">{campaign.description}</p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-600">{campaign.payout}</p>
                    <p className="text-xs text-slate-600">Payout</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-blue-600">{campaign.estimatedHours}</p>
                    <p className="text-xs text-slate-600">Est. Time</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Users className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-purple-600">{campaign.participantsCount}/{campaign.maxParticipants}</p>
                    <p className="text-xs text-slate-600">Participants</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-orange-600">{new Date(campaign.deadline).toLocaleDateString()}</p>
                    <p className="text-xs text-slate-600">Deadline</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information Tabs */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <Tabs defaultValue="brief" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="brief">Brief</TabsTrigger>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="terms">Terms</TabsTrigger>
                    <TabsTrigger value="assets">Assets</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="brief" className="mt-6">
                    <div className="prose prose-sm max-w-none">
                      <h3 className="text-lg font-semibold mb-4">Campaign Brief</h3>
                      <div className="whitespace-pre-line text-slate-700">
                        {campaign.fullBrief}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="requirements" className="mt-6">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Audience Requirements</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm text-slate-600">Minimum Followers:</span>
                            <Badge className="ml-2">{campaign.requirements.minFollowers}</Badge>
                          </div>
                          <div>
                            <span className="text-sm text-slate-600">Demographics:</span>
                            <span className="ml-2 text-sm text-slate-900">{campaign.requirements.demographics}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Platform Requirements</h4>
                        <div className="flex flex-wrap gap-2">
                          {campaign.requirements.platforms.map((platform) => (
                            <Badge key={platform} variant="secondary">{platform}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Content Types</h4>
                        <div className="flex flex-wrap gap-2">
                          {campaign.requirements.contentType.map((type) => (
                            <Badge key={type} variant="outline">{type}</Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Niches</h4>
                        <div className="flex flex-wrap gap-2">
                          {campaign.requirements.niches.map((niche) => (
                            <Badge key={niche} className="bg-blue-50 text-blue-700">{niche}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="terms" className="mt-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-yellow-800">Important Terms</h4>
                            <p className="text-sm text-yellow-700 mt-1">Please read all terms carefully before applying.</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-slate-900">Payment Details</h4>
                          <ul className="mt-2 space-y-1 text-sm text-slate-600">
                            <li>• Base Amount: {campaign.payoutDetails.baseAmount}</li>
                            <li>• Bonus: {campaign.payoutDetails.bonusOpportunities}</li>
                            <li>• Payment Terms: {campaign.payoutDetails.paymentTerms}</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-900">Usage Rights</h4>
                          <ul className="mt-2 space-y-1 text-sm text-slate-600">
                            <li>• Exclusivity: {campaign.terms.exclusivity}</li>
                            <li>• Content Usage: {campaign.terms.usage}</li>
                            <li>• Revisions: {campaign.terms.revisions}</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-900">Timeline</h4>
                          <ul className="mt-2 space-y-1 text-sm text-slate-600">
                            <li>• Application Deadline: {new Date(campaign.timeline.applicationDeadline).toLocaleDateString()}</li>
                            <li>• Content Submission: {new Date(campaign.timeline.contentSubmissionDeadline).toLocaleDateString()}</li>
                            <li>• Campaign End: {new Date(campaign.timeline.campaignEnd).toLocaleDateString()}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="assets" className="mt-6">
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600">Download brand assets to help create your content:</p>
                      
                      <div className="space-y-3">
                        {campaign.brandAssets.map((asset, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-slate-400" />
                              <div>
                                <p className="text-sm font-medium text-slate-900">{asset.name}</p>
                                <p className="text-xs text-slate-500">{asset.size}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Application Status */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Campaign Open</h3>
                    <p className="text-sm text-slate-600">8 spots remaining</p>
                  </div>
                  <Button 
                    onClick={handleApply}
                    disabled={campaign.hasApplied}
                    className="w-full"
                  >
                    {campaign.hasApplied ? 'Application Submitted' : 'Apply Now'}
                  </Button>
                  {!campaign.hasApplied && (
                    <p className="text-xs text-slate-500">No application fee required</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Location</p>
                    <p className="text-sm text-slate-600">{campaign.location.join(', ')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Camera className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Difficulty</p>
                    <Badge className={`text-xs ${
                      campaign.difficulty === 'easy' ? 'bg-green-50 text-green-600' : 
                      campaign.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-600' : 
                      'bg-red-50 text-red-600'
                    }`}>
                      {campaign.difficulty.charAt(0).toUpperCase() + campaign.difficulty.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Info className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Campaign ID</p>
                    <p className="text-sm text-slate-600 font-mono">#{campaign.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-3">Need Help?</h3>
                <p className="text-sm text-slate-600 mb-4">Have questions about this campaign?</p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
