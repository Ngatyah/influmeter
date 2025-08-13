import React, { useState, useEffect } from 'react'
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
import { campaignService, Campaign } from '../../services/campaign.service'
import { Loader2, RefreshCw, AlertTriangle } from 'lucide-react'
import { formatSafeDate } from '../../utils/dateUtils'

export default function CampaignDetailInfluencer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasApplied, setHasApplied] = useState(false)

  // Load campaign from backend
  useEffect(() => {
    if (id) {
      loadCampaign()
    }
  }, [id])

  const loadCampaign = async () => {
    try {
      setLoading(true)
      setError(null)
      const campaignData = await campaignService.getCampaign(id!)
      setCampaign(campaignData)
      
      // Check if user has already applied
      const applicationStatus = await campaignService.checkApplicationStatus(id!)
      setHasApplied(applicationStatus.hasApplied)
    } catch (error) {
      console.error('Failed to load campaign:', error)
      setError(error instanceof Error ? error.message : 'Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    navigate(`/campaigns/${id}/apply`)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-600">Loading campaign...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Failed to Load Campaign</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <div className="space-x-2">
              <Button onClick={loadCampaign}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/campaigns/browse')}>Back to Campaigns</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No campaign data
  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600">Campaign not found</p>
          </div>
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
                    src={campaign?.brand?.brandProfile?.logoUrl || '/api/placeholder/80/80'} 
                    alt={campaign?.brand?.brandProfile?.companyName || 'Brand'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {campaign?.brand?.brandProfile?.companyName || 
                         `${campaign?.brand?.profile?.firstName || ''} ${campaign?.brand?.profile?.lastName || ''}`.trim() || 
                         'Unknown Brand'}
                      </h3>
                      <Star className="w-5 h-5 text-yellow-500" />
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{campaign?.description || 'Campaign description not available'}</p>
                    <Button variant="ghost" size="sm" className="text-blue-600 p-0 h-auto">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Visit Website
                    </Button>
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-4">{campaign?.title}</h1>
                <p className="text-slate-600 mb-6">{campaign?.description || 'Campaign description not available'}</p>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-600">{campaign?.budget ? `$${campaign.budget}` : 'TBD'}</p>
                    <p className="text-xs text-slate-600">Payout</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-blue-600">3-5 hours</p>
                    <p className="text-xs text-slate-600">Est. Time</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Users className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-purple-600">{campaign?._count?.participants || 0}/50</p>
                    <p className="text-xs text-slate-600">Participants</p>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                    <p className="text-lg font-bold text-orange-600">{campaign?.endDate ? formatSafeDate(campaign.endDate) : 'TBD'}</p>
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
                        {campaign?.description || 'Full campaign brief will be available after application approval.'}
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
                            <Badge className="ml-2">5K+</Badge>
                          </div>
                          <div>
                            <span className="text-sm text-slate-600">Demographics:</span>
                            <span className="ml-2 text-sm text-slate-900">All demographics welcome</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Platform Requirements</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">Instagram</Badge>
                          <Badge variant="secondary">TikTok</Badge>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Content Types</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Posts</Badge>
                          <Badge variant="outline">Stories</Badge>
                          <Badge variant="outline">Reels</Badge>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-900 mb-3">Niches</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-blue-50 text-blue-700">Lifestyle</Badge>
                          <Badge className="bg-blue-50 text-blue-700">General</Badge>
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
                            <li>• Base Amount: {campaign?.budget ? `$${campaign.budget}` : 'TBD'}</li>
                            <li>• Bonus: Performance-based bonus opportunities available</li>
                            <li>• Payment Terms: Payment within 14 days of content approval</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-900">Usage Rights</h4>
                          <ul className="mt-2 space-y-1 text-sm text-slate-600">
                            <li>• Exclusivity: 30 days exclusivity for similar brands</li>
                            <li>• Content Usage: Brand may repost content with credit</li>
                            <li>• Revisions: Up to 2 revision requests may be made</li>
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-slate-900">Timeline</h4>
                          <ul className="mt-2 space-y-1 text-sm text-slate-600">
                            <li>• Campaign Start: {campaign?.startDate ? formatSafeDate(campaign.startDate) : 'TBD'}</li>
                            <li>• Campaign End: {campaign?.endDate ? formatSafeDate(campaign.endDate) : 'TBD'}</li>
                            <li>• Application Review: 2-3 business days</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="assets" className="mt-6">
                    <div className="space-y-4">
                      <p className="text-sm text-slate-600">Brand assets will be available after application approval:</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg opacity-50">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">Brand Guidelines.pdf</p>
                              <p className="text-xs text-slate-500">Available after approval</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" disabled>
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg opacity-50">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-slate-400" />
                            <div>
                              <p className="text-sm font-medium text-slate-900">Product Images.zip</p>
                              <p className="text-xs text-slate-500">Available after approval</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" disabled>
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
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
                    disabled={hasApplied}
                    className="w-full"
                  >
                    {hasApplied ? 'Application Submitted' : 'Apply Now'}
                  </Button>
                  {!hasApplied && (
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
                    <p className="text-sm text-slate-600">Global</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Camera className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Difficulty</p>
                    <Badge className="text-xs bg-yellow-50 text-yellow-600">
                      Medium
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Info className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">Campaign ID</p>
                    <p className="text-sm text-slate-600 font-mono">#{campaign?.id}</p>
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
