import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Loader2,
  RefreshCw,
  Target,
  Upload,
  LinkIcon,
  ExternalLink,
  Camera,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import ErrorBoundary from '../../components/ErrorBoundary'
import { campaignService, CampaignApplication } from '../../services/campaign.service'
import { contentService, ContentSubmission } from '../../services/content.service'
import { formatSafeDate, formatSafeBudget } from '../../utils/dateUtils'

// Helper functions for status display
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'accepted': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending': return <Clock className="w-4 h-4" />
    case 'accepted': return <CheckCircle className="w-4 h-4" />
    case 'rejected': return <XCircle className="w-4 h-4" />
    default: return <AlertCircle className="w-4 h-4" />
  }
}

export default function MyApplications() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [applications, setApplications] = useState<CampaignApplication[]>([])
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([])
  const [selectedTab, setSelectedTab] = useState('active')

  useEffect(() => {
    loadData().catch(err => {
      console.error('Error in useEffect:', err)
      setError('Failed to load data')
      setLoading(false)
    })
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load applications
      const applicationsData = await campaignService.getMyApplications()
      setApplications(applicationsData || [])
      
      // Get accepted applications and load their content
      const acceptedApplications = (applicationsData || []).filter(app => app.status === 'ACCEPTED')
      const activeCampaignsData = await Promise.all(
        acceptedApplications.map(async (app) => {
          try {
            // Load real content submissions for this campaign
            const contentData = await contentService.getMyContentSubmissions({ 
              campaignId: app.campaign.id 
            })
            return {
              campaign: app.campaign,
              application: app,
              contentSubmissions: contentData.contentSubmissions || []
            }
          } catch (error) {
            console.error(`Failed to load content for campaign ${app.campaign.id}:`, error)
            return {
              campaign: app.campaign,
              application: app,
              contentSubmissions: []
            }
          }
        })
      )
      
      setActiveCampaigns(activeCampaignsData)
    } catch (error) {
      console.error('Failed to load data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }


  const refreshContent = async () => {
    try {
      setContentLoading(true)
      await loadData()
    } catch (error) {
      console.error('Failed to refresh content:', error)
      setError('Failed to refresh content')
    } finally {
      setContentLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-600">Loading applications...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error boundary fallback
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-red-600 mb-2">Error Loading Applications</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex space-x-2 justify-center">
              <Button onClick={() => setError(null)} variant="outline">
                Dismiss
              </Button>
              <Button onClick={loadData} className="bg-blue-600 hover:bg-blue-700">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/influencer')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">My Campaigns</h1>
              <p className="text-slate-600">
                {selectedTab === 'applications' 
                  ? `${applications?.length || 0} applications` 
                  : `${activeCampaigns?.length || 0} active campaigns`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshContent}
              disabled={loading || contentLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading || contentLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => navigate('/campaigns/browse')}>
              <Target className="w-4 h-4 mr-2" />
              Browse More
            </Button>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="active" value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="active" className="relative">
              Active Campaigns
              {activeCampaigns.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeCampaigns.length}
                </div>
              )}
            </TabsTrigger>
            <TabsTrigger value="applications">All Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-8">
            {/* Active Campaigns with Content Management */}
            {activeCampaigns.length === 0 && !loading ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No active campaigns yet</h3>
                <p className="text-slate-600 mb-6">
                  Once your applications are accepted, they'll appear here for content management.
                </p>
                <Button onClick={() => setSelectedTab('applications')}>
                  View Applications
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {activeCampaigns.map((campaignData) => (
                  <ActiveCampaignCard 
                    key={campaignData.campaign.id} 
                    campaignData={campaignData} 
                    onRefresh={refreshContent}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="applications" className="mt-8">
            {/* Applications Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {(applications || []).map((application) => (
                <ErrorBoundary key={application?.id || Math.random()}>
                  <ApplicationCard application={application} />
                </ErrorBoundary>
              ))}
            </div>

            {/* Empty State */}
            {(applications?.length || 0) === 0 && !loading && (
              <div className="text-center py-12">
                <Target className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No applications yet</h3>
                <p className="text-slate-600 mb-6">
                  Start applying to campaigns to see them here
                </p>
                <Button onClick={() => navigate('/campaigns/browse')}>
                  Browse Available Campaigns
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ApplicationCard({ application }: { application: CampaignApplication }) {
  const navigate = useNavigate()

  // Defensive programming - ensure required properties exist
  if (!application || !application.campaign) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <p className="text-red-600">Invalid application data</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        {/* Status Badge */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${getStatusColor(application.status || 'pending')} flex items-center space-x-1`}>
            {getStatusIcon(application.status || 'pending')}
            <span className="capitalize">{(application.status || 'pending').toLowerCase()}</span>
          </Badge>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/campaigns/${application.campaign?.id}/details`)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {/* Campaign Info */}
        <div className="mb-4">
          <h3 className="font-semibold text-slate-900 mb-1">{application.campaign?.title || 'Untitled Campaign'}</h3>
          <p className="text-sm text-slate-600">
            {application.campaign?.brand?.brandProfile?.companyName || 
             `${application.campaign?.brand?.profile?.firstName || ''} ${application.campaign?.brand?.profile?.lastName || ''}`.trim() ||
             'Brand'}
          </p>
        </div>

        {/* Campaign Details */}
        <div className="space-y-2 mb-4">
          {application.campaign?.budget && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <DollarSign className="w-3 h-3 text-green-500" />
                <span className="text-slate-600">Budget:</span>
              </div>
              <span className="font-medium text-green-600">${formatSafeBudget(application.campaign.budget)}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3 text-orange-500" />
              <span className="text-slate-600">Applied:</span>
            </div>
            <span className="text-slate-900">
              {formatSafeDate(application.appliedAt)}
            </span>
          </div>

          {application.campaign?.endDate && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-blue-500" />
                <span className="text-slate-600">Deadline:</span>
              </div>
              <span className="text-slate-900">{formatSafeDate(application.campaign.endDate)}</span>
            </div>
          )}
        </div>

        {/* Application Message Preview */}
        {application.applicationData?.message && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-1">Your message:</p>
            <p className="text-sm text-slate-700 line-clamp-2 bg-slate-50 p-2 rounded">
              {application.applicationData.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate(`/campaigns/${application.campaign?.id}/details`)}
          >
            View Campaign
          </Button>
          {application.status === 'ACCEPTED' && (
            <Button 
              size="sm" 
              onClick={() => navigate(`/campaigns/${application.campaign?.id}/submit`)}
              className="bg-green-500 hover:bg-green-600"
            >
              Submit Content
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ActiveCampaignCard({ campaignData, onRefresh }: { 
  campaignData: any; 
  onRefresh: () => void 
}) {
  const navigate = useNavigate()
  const { campaign, contentSubmissions } = campaignData

  const getContentStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getContentStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircle className="w-3 h-3" />
      case 'pending': return <Clock className="w-3 h-3" />
      case 'rejected': return <XCircle className="w-3 h-3" />
      case 'completed': return <CheckCircle className="w-3 h-3" />
      default: return <AlertCircle className="w-3 h-3" />
    }
  }

  const needsUrlSubmission = (content: ContentSubmission, campaign: any): boolean => {
    // Don't allow URL submission if campaign is paid/completed
    const campaignNotPaid = campaign?.status !== 'PAID' && campaign?.status !== 'COMPLETED'
    
    // Allow URL submission for approved content only if campaign is still active (not paid)
    return content.status === 'APPROVED' && campaignNotPaid
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{campaign?.title || 'Untitled Campaign'}</CardTitle>
            <p className="text-slate-600">
              {campaign?.brand?.brandProfile?.companyName || 
               `${campaign?.brand?.profile?.firstName || ''} ${campaign?.brand?.profile?.lastName || ''}`.trim() ||
               'Brand'}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
              {campaign?.budget && (
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-3 h-3 text-green-500" />
                  <span>${formatSafeBudget(campaign.budget)}</span>
                </div>
              )}
              {campaign?.endDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-blue-500" />
                  <span>Due: {formatSafeDate(campaign.endDate)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={
              campaign?.status === 'PAID' || campaign?.status === 'COMPLETED' 
                ? "bg-blue-100 text-blue-800" 
                : "bg-green-100 text-green-800"
            }>
              <CheckCircle className="w-3 h-3 mr-1" />
              {campaign?.status === 'PAID' ? 'Paid' : 
               campaign?.status === 'COMPLETED' ? 'Completed' : 
               'Active'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Actions */}
        {/* <div className="flex space-x-2">
          <Button 
            size="sm" 
            onClick={() => navigate(`/campaigns/${campaign.id}/submit`)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-3 h-3 mr-1" />
            Submit New Content
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/campaigns/${campaign.id}/details`)}
          >
            <Eye className="w-3 h-3 mr-1" />
            View Campaign
          </Button>
        </div> */}

        {/* Content Submissions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-slate-900">My Content Submissions</h4>
            <span className="text-sm text-slate-500">{contentSubmissions?.length || 0} submissions</span>
          </div>

          {contentSubmissions && contentSubmissions.length > 0 ? (
            <div className="space-y-4">
              {contentSubmissions.map((content: ContentSubmission) => (
                <div key={content.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h5 className="font-medium text-slate-900">{content.title}</h5>
                        <Badge className={getContentStatusColor(content.status)}>
                          {getContentStatusIcon(content.status)}
                          <span className="ml-1 capitalize">{content.status?.toLowerCase()}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{content.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>Submitted: {formatSafeDate(content.submittedAt)}</span>
                        {content.amount && (
                          <span className="text-green-600 font-medium">${content.amount}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Content preview */}
                    {content.files && content.files.length > 0 && (
                      <div className="ml-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200">
                          {content.files[0].fileType.startsWith('image/') ? (
                            <img 
                              src={content.files[0].thumbnailUrl || content.files[0].fileUrl}
                              alt="Content preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Camera className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Platforms */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xs text-slate-500">Platforms:</span>
                    {content.platforms?.map((platform) => (
                      <Badge key={platform} variant="outline" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>

                  {/* Published Posts */}
                  {content.publishedPosts && content.publishedPosts.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-900">Published Posts</span>
                        <span className="text-xs text-green-700">{content.publishedPosts.length} post(s)</span>
                      </div>
                      {content.publishedPosts.map((post, index) => (
                        <div key={post.id || index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">{post.platform}</Badge>
                            <span className="text-green-800">{post.postType}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            {post.performance && (
                              <div className="flex items-center space-x-2 text-green-700">
                                <Eye className="w-3 h-3" />
                                <span>{post.performance.views.toLocaleString()}</span>
                                <Heart className="w-3 h-3" />
                                <span>{post.performance.likes.toLocaleString()}</span>
                              </div>
                            )}
                            <Button variant="ghost" size="sm" asChild className="h-6 px-2">
                              <a href={post.postUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    {needsUrlSubmission(content, campaign) && (
                      <Button 
                        size="sm" 
                        onClick={() => navigate(`/campaigns/${content.campaignId}/submit-urls/${content.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <LinkIcon className="w-3 h-3 mr-1" />
                        {content.publishedPosts && content.publishedPosts.length > 0 ? 'Add More URLs' : 'Submit Live URLs'}
                      </Button>
                    )}
                    
                    {content.publishedPosts && content.publishedPosts.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (content.publishedPosts && content.publishedPosts[0]) {
                            window.open(content.publishedPosts[0].postUrl, '_blank')
                          }
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Post
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-slate-50 rounded-lg border border-slate-200">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 mb-3">No content submitted yet</p>
              <Button 
                size="sm"
                onClick={() => navigate(`/campaigns/${campaign.id}/submit`)}
              >
                Submit Your First Content
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}