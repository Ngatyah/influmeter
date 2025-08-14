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
  CheckCircle,
  XCircle,
  Edit3,
  Eye,
  Camera,
  Play,
  AlertTriangle,
  MoreHorizontal,
  TrendingUp,
  Download,
  Loader2,
  RefreshCw,
  ExternalLink,
  Heart,
  MessageCircle,
  Share2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { campaignService, Campaign } from '../../services/campaign.service'
import { contentService } from '../../services/content.service'
import ApplicationReviewModal from '../../components/ApplicationReviewModal'
import { formatSafeDate, formatSafeDatetime } from '../../utils/dateUtils'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'applications', label: 'Applications' },
  { id: 'influencers', label: 'Influencers' },
  { id: 'content', label: 'Content Approvals' },
  { id: 'metrics', label: 'Metrics' },
]

// Helper functions
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'bg-green-100 text-green-800'
    case 'completed': return 'bg-blue-100 text-blue-800'
    case 'draft': return 'bg-gray-100 text-gray-800'
    case 'paused': return 'bg-yellow-100 text-yellow-800'
    case 'cancelled': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatCurrency = (amount: number | undefined | null) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0'
  return `$${amount.toLocaleString()}`
}

const formatNumber = (num: number | undefined | null) => {
  if (num === null || num === undefined || isNaN(num)) return '0'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

// Using formatSafeDate from utils instead of this function

export default function CampaignDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [showContentModal, setShowContentModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [showInfluencerModal, setShowInfluencerModal] = useState(false)
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null)
  
  // State management
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [participants, setParticipants] = useState<any[]>([])
  const [contentSubmissions, setContentSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [participantsLoading, setParticipantsLoading] = useState(false)
  const [contentLoading, setContentLoading] = useState(false)

  // Load campaign data
  useEffect(() => {
    if (id) {
      loadCampaign()
    }
  }, [id])

  // Load participants and content when campaign is loaded
  useEffect(() => {
    if (campaign) {
      loadParticipants()
      loadContentSubmissions()
    }
  }, [campaign])

  const loadCampaign = async (showRefreshLoader = false) => {
    if (!id) return

    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const campaignData = await campaignService.getCampaign(id)
      setCampaign(campaignData)
      
      // Load applications if this is a brand user
      await loadApplications()
    } catch (error) {
      console.error('Failed to load campaign:', error)
      setError(error instanceof Error ? error.message : 'Failed to load campaign')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const loadApplications = async () => {
    if (!id) return

    try {
      setApplicationsLoading(true)
      const applicationsData = await campaignService.getCampaignApplications(id)
      setApplications(applicationsData)
    } catch (error) {
      console.error('Failed to load applications:', error)
      // Don't show error if it's just because user doesn't have permission (influencer vs brand)
    } finally {
      setApplicationsLoading(false)
    }
  }

  const loadParticipants = async () => {
    if (!id || !campaign) return

    try {
      setParticipantsLoading(true)
      // Get participants from the campaign data
      if (campaign.participants) {
        setParticipants(campaign.participants)
      }
    } catch (error) {
      console.error('Failed to load participants:', error)
    } finally {
      setParticipantsLoading(false)
    }
  }

  const loadContentSubmissions = async () => {
    if (!id) return

    try {
      setContentLoading(true)
      const contentData = await contentService.getBrandContentSubmissions({ campaignId: id })
      setContentSubmissions(contentData.contentSubmissions)
    } catch (error) {
      console.error('Failed to load content submissions:', error)
    } finally {
      setContentLoading(false)
    }
  }

  const refreshCampaign = () => {
    loadCampaign(true)
  }

  // Update campaign status
  const updateCampaignStatus = async (newStatus: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED') => {
    if (!campaign) return

    try {
      setRefreshing(true)
      const updatedCampaign = await campaignService.updateCampaignStatus(campaign.id, newStatus)
      setCampaign(updatedCampaign)
      alert(`Campaign status updated to ${newStatus}`)
    } catch (error) {
      console.error('Failed to update campaign status:', error)
      alert('Failed to update campaign status')
    } finally {
      setRefreshing(false)
    }
  }

  // Update application status
  const updateApplicationStatus = async (applicationId: string, status: 'ACCEPTED' | 'REJECTED', message?: string) => {
    try {
      await campaignService.updateApplicationStatus(applicationId, status, message)
      // Reload applications and campaign data
      await loadApplications()
      await loadCampaign(true)
      alert(`Application ${status.toLowerCase()} successfully`)
    } catch (error) {
      console.error('Failed to update application status:', error)
      alert('Failed to update application status')
    }
  }

  // Update content status
  const updateContentStatus = async (contentId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'PAID', feedback?: string) => {
    try {
      await contentService.updateContentStatus(contentId, status, feedback)
      // Reload content submissions
      await loadContentSubmissions()
      alert(`Content ${status.toLowerCase()} successfully`)
    } catch (error) {
      console.error('Failed to update content status:', error)
      alert('Failed to update content status')
    }
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
  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              {error || 'Campaign not found'}
            </h2>
            <div className="space-x-3">
              <Button variant="outline" onClick={() => navigate('/campaigns')}>
                Back to Campaigns
              </Button>
              <Button onClick={refreshCampaign} disabled={refreshing}>
                {refreshing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <Play className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'draft': return <Edit3 className="w-4 h-4" />
      case 'paused': return <Clock className="w-4 h-4" />
      case 'cancelled': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }


  // Mock data for features not yet implemented by backend
  const mockCampaign = {
    id,
    title: id === '1' ? 'Summer Skincare Launch' : 'Product Launch',
    status: id === '1' ? 'active' : 'pending',
    objective: 'Product Launch',
    budget: id === '1' ? '$5,000' : '$3,200',
    startDate: '2024-04-15',
    endDate: '2024-05-15',
    influencersJoined: id === '1' ? 12 : 8,
    targetInfluencers: id === '1' ? 20 : 15,
    contentSubmitted: id === '1' ? 8 : 3,
    contentApproved: id === '1' ? 5 : 1,
    totalReach: id === '1' ? '2.1M' : '890K',
    engagement: id === '1' ? '12.3%' : '10.1%',
    description: id === '1' 
      ? 'Launch our new summer skincare line targeting young adults in Kenya and Tanzania with focus on natural ingredients.'
      : 'Promote our latest product to tech-savvy millennials across East Africa.'
  }

  // Add mock content submissions data
 

  // Add participating influencers data with their content
  const participatingInfluencers = [
    {
      id: '1',
      name: 'Murugi Munyi',
      username: '@murugimunyi',
      avatar: '/api/placeholder/60/60',
      followers: '532K',
      engagement: '8.4%',
      verified: true,
      joinedDate: '2024-04-16',
      status: 'active',
      contentSubmissions: [
        {
          id: 'c1',
          type: 'image',
          files: ['/api/placeholder/400/400'],
          caption: 'Just tried the new @niveakenya summer collection! 🌞 My skin feels so hydrated and protected. Perfect for our Kenyan sun! #NIVEASummer #NaturalGlow #SkincareRoutine',
          platforms: ['Instagram', 'TikTok'],
          hashtags: ['#NIVEASummer', '#NaturalGlow', '#SkincareRoutine'],
          submittedAt: '2024-04-20T10:30:00Z',
          status: 'pending'
        },
        {
          id: 'c2',
          type: 'video',
          files: ['/api/placeholder/400/600'],
          caption: 'My morning skincare routine featuring NIVEA products ☀️ #NIVEASummer #MorningRoutine',
          platforms: ['TikTok'],
          hashtags: ['#NIVEASummer', '#MorningRoutine'],
          submittedAt: '2024-04-18T08:15:00Z',
          status: 'approved'
        }
      ]
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      username: '@sarahjohnson',
      avatar: '/api/placeholder/60/60',
      followers: '245K',
      engagement: '12.1%',
      verified: false,
      joinedDate: '2024-04-17',
      status: 'active',
      contentSubmissions: [
        {
          id: 'c3',
          type: 'image',
          files: ['/api/placeholder/400/500'],
          caption: 'Testing the amazing skincare routine! Love how my skin feels ✨ #NIVEASummer #SkincareRoutine',
          platforms: ['Instagram'],
          hashtags: ['#NIVEASummer', '#SkincareRoutine'],
          submittedAt: '2024-04-19T14:20:00Z',
          status: 'approved'
        }
      ]
    },
    {
      id: '3',
      name: 'David Kim',
      username: '@davidkim',
      avatar: '/api/placeholder/60/60',
      followers: '128K',
      engagement: '15.2%',
      verified: false,
      joinedDate: '2024-04-18',
      status: 'pending',
      contentSubmissions: [
        {
          id: 'c4',
          type: 'image',
          files: ['/api/placeholder/400/500'],
          caption: 'Morning skincare routine with @niveakenya products! Perfect start to the day 🌅 #NIVEASummer #MorningRoutine',
          platforms: ['Instagram'],
          hashtags: ['#NIVEASummer', '#MorningRoutine'],
          submittedAt: '2024-04-18T09:15:00Z',
          status: 'rejected'
        }
      ]
    }
  ]

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
              <h1 className="text-2xl font-semibold text-slate-900">{campaign.title}</h1>
              <div className="flex items-center space-x-4 mt-1">
                <Badge className={`${getStatusColor(campaign.status)} flex items-center space-x-1`}>
                  {getStatusIcon(campaign.status)}
                  <span className="capitalize">{campaign.status.toLowerCase()}</span>
                </Badge>
                <span className="text-sm text-slate-600">Campaign #{campaign.id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                const newStatus = campaign.status.toLowerCase() === 'active' ? 'PAUSED' : 'ACTIVE'
                updateCampaignStatus(newStatus)
              }}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : campaign.status.toLowerCase() === 'active' ? (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar with Tabs */}
        <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-slate-200 p-6">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && <OverviewTab campaign={campaign} />}
          {activeTab === 'applications' && (
            <ApplicationsTab 
              applications={applications}
              loading={applicationsLoading}
              onStatusUpdate={updateApplicationStatus}
              onRefresh={loadApplications}
            />
          )}
          {activeTab === 'influencers' && (
            <InfluencersTab 
              campaignId={id}
              participants={participants}
              loading={participantsLoading}
              onRefresh={loadParticipants}
            />
          )}
          {activeTab === 'content' && (
            <ContentTab 
              contentSubmissions={contentSubmissions}
              loading={contentLoading}
              onStatusUpdate={updateContentStatus}
              onRefresh={loadContentSubmissions}
            />
          )}
          {activeTab === 'metrics' && <MetricsTab campaign={campaign} />}
        </main>
      </div>

      {/* Content Detail Modal */}
      {showContentModal && selectedContent && (
        <ContentDetailModal
          content={selectedContent}
          onClose={() => setShowContentModal(false)}
          onStatusChange={(contentId, newStatus) => {
            // Handle status change
            console.log('Status changed:', contentId, newStatus)
            setShowContentModal(false)
          }}
        />
      )}

    </div>
  )
}

function ApplicationsTab({ applications, loading, onStatusUpdate, onRefresh }: { 
  applications: any[]
  loading: boolean
  onStatusUpdate: (applicationId: string, status: 'ACCEPTED' | 'REJECTED', message?: string) => void
  onRefresh: () => void
}) {
  const navigate = useNavigate()
  const [selectedApplication, setSelectedApplication] = useState<any>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  const getApplicationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getApplicationStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Campaign Applications</h2>
          <p className="text-slate-600">{applications.length} total applications</p>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Applications Yet</h3>
              <p className="text-slate-600">
                Applications will appear here as influencers apply to your campaign.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((application) => (
                <div 
                  key={application.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/influencer/${application.influencer.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    <img 
                      src={application.influencer?.profile?.avatarUrl || '/api/placeholder/60/60'}
                      alt={`${application.influencer?.profile?.firstName || ''} ${application.influencer?.profile?.lastName || ''}`.trim() || 'Influencer'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-slate-900">
                          {`${application.influencer?.profile?.firstName || ''} ${application.influencer?.profile?.lastName || ''}`.trim() || 'Unknown'}
                        </h4>
                        {application.influencer?.influencerProfile?.verified && (
                          <Star className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm text-slate-600">
                        Applied on {formatSafeDate(application.appliedAt)}
                      </p>
                      {application.applicationData?.message && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 max-w-md">
                          "{application.applicationData.message}"
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getApplicationStatusColor(application.status)} flex items-center space-x-1`}>
                      {getApplicationStatusIcon(application.status)}
                      <span className="capitalize">{application.status.toLowerCase()}</span>
                    </Badge>
                    
                    {application.status === 'PENDING' && (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={(e) => {
                            e.stopPropagation()
                            onStatusUpdate(application.id, 'ACCEPTED')
                          }}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            onStatusUpdate(application.id, 'REJECTED')
                          }}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedApplication(application)
                        setShowReviewModal(true)
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Review Modal */}
      {showReviewModal && selectedApplication && (
        <ApplicationReviewModal
          application={selectedApplication}
          onClose={() => setShowReviewModal(false)}
          onStatusUpdate={(applicationId, status, message) => {
            onStatusUpdate(applicationId, status, message)
            setShowReviewModal(false)
          }}
        />
      )}
    </div>
  )
}

function OverviewTab({ campaign }: { campaign: any }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Influencers Joined</p>
                <p className="text-2xl font-bold text-slate-900">
                  {campaign._count?.participants || 0}/{campaign.maxInfluencers || '∞'}
                </p>
              </div>
              <Users className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Applications</p>
                <p className="text-2xl font-bold text-slate-900">{campaign._count?.applications || 0}</p>
              </div>
              <Eye className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Content Pieces</p>
                <p className="text-2xl font-bold text-slate-900">{campaign._count?.contentSubmissions || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Budget</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(campaign.budget)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Posts Analytics Card - NEW */}
      <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExternalLink className="w-5 h-5 text-green-600" />
            <span>Live Posts & Performance</span>
            <Badge variant="outline" className="text-xs text-green-700 border-green-300">
              Real-time Analytics
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-green-700 mb-2">
              🔗 {/* Replace with actual count when backend is connected */}
              {campaign.contentSubmissions?.reduce((count: number, content: any) => 
                count + (content.publishedPosts?.length || 0), 0) || 0}
            </div>
            <div className="text-sm text-slate-600 mb-4">Total Live Posts Submitted</div>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-2 bg-white rounded-lg border border-green-200">
                <Eye className="w-4 h-4 mx-auto mb-1 text-green-600" />
                <div className="text-xs font-medium text-green-800">Views</div>
                <div className="text-sm font-bold text-green-900">
                  {/* Calculate total views from all published posts */}
                  {campaign.contentSubmissions?.reduce((total: number, content: any) => 
                    total + (content.publishedPosts?.reduce((sum: number, post: any) => 
                      sum + (post.performance?.views || 0), 0) || 0), 0)?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-green-200">
                <Heart className="w-4 h-4 mx-auto mb-1 text-green-600" />
                <div className="text-xs font-medium text-green-800">Likes</div>
                <div className="text-sm font-bold text-green-900">
                  {campaign.contentSubmissions?.reduce((total: number, content: any) => 
                    total + (content.publishedPosts?.reduce((sum: number, post: any) => 
                      sum + (post.performance?.likes || 0), 0) || 0), 0)?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-green-200">
                <MessageCircle className="w-4 h-4 mx-auto mb-1 text-green-600" />
                <div className="text-xs font-medium text-green-800">Comments</div>
                <div className="text-sm font-bold text-green-900">
                  {campaign.contentSubmissions?.reduce((total: number, content: any) => 
                    total + (content.publishedPosts?.reduce((sum: number, post: any) => 
                      sum + (post.performance?.comments || 0), 0) || 0), 0)?.toLocaleString() || '0'}
                </div>
              </div>
              <div className="p-2 bg-white rounded-lg border border-green-200">
                <Share2 className="w-4 h-4 mx-auto mb-1 text-green-600" />
                <div className="text-xs font-medium text-green-800">Shares</div>
                <div className="text-sm font-bold text-green-900">
                  {campaign.contentSubmissions?.reduce((total: number, content: any) => 
                    total + (content.publishedPosts?.reduce((sum: number, post: any) => 
                      sum + (post.performance?.shares || 0), 0) || 0), 0)?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs text-slate-500">
              📊 Analytics updated from live social media posts
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Campaign Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-600">Objective</label>
              <p className="text-slate-900">{campaign.objective}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600">Description</label>
              <p className="text-slate-900">{campaign.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Start Date</label>
                <p className="text-slate-900">{formatSafeDate(campaign.startDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">End Date</label>
                <p className="text-slate-900">{formatSafeDate(campaign.endDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Content Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Content Submitted</span>
              <span className="font-semibold">{campaign._count?.contentSubmissions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Participants</span>
              <span className="font-semibold text-green-600">{campaign._count?.participants || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Applications</span>
              <span className="font-semibold text-blue-600">
                {campaign._count?.applications || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InfluencersTab({ campaignId, participants, loading, onRefresh }: { 
  campaignId: string | undefined
  participants: any[]
  loading: boolean
  onRefresh: () => void
}) {
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading participants...</p>
        </div>
      </div>
    )
  }

  const participatingInfluencers = participants.map(participant => ({
    id: participant.influencer?.id || participant.id,
    name: `${participant.influencer?.profile?.firstName || ''} ${participant.influencer?.profile?.lastName || ''}`.trim() || 'Unknown',
    username: participant.influencer?.influencerProfile?.bio || `@${participant.influencer?.profile?.firstName?.toLowerCase() || 'user'}`,
    avatar: participant.influencer?.profile?.avatarUrl || '/api/placeholder/60/60',
    followers: participant.influencer?.socialAccounts?.[0]?.followersCount ? 
      `${Math.round(participant.influencer.socialAccounts[0].followersCount / 1000)}K` : 'N/A',
    engagement: participant.influencer?.socialAccounts?.[0]?.engagementRate ? 
      `${participant.influencer.socialAccounts[0].engagementRate}%` : 'N/A',
    verified: participant.influencer?.influencerProfile?.verified || false,
    joinedDate: participant.joinedAt || participant.createdAt,
    status: participant.status?.toLowerCase() || 'active',
    contentSubmissions: [] // This would need to come from content API
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Campaign Participants</h2>
          <p className="text-slate-600">{participants.length} active participants</p>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {participants.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Participants Yet</h3>
              <p className="text-slate-600">
                Participants will appear here when applications are accepted.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {participatingInfluencers.map((influencer) => (
              <div 
                key={influencer.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/campaigns/${campaignId}/influencer/${influencer.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <img 
                    src={influencer.avatar} 
                    alt={influencer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-slate-900">{influencer.name}</h4>
                      {influencer.verified && <Star className="w-4 h-4 text-yellow-500" />}
                    </div>
                    <p className="text-sm text-slate-600">
                      {influencer.followers} followers • {influencer.engagement} engagement
                    </p>
                    <p className="text-xs text-slate-500">
                      Joined {formatSafeDate(influencer.joinedDate)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={influencer.status === 'active' ? 'default' : 'secondary'}
                    className={influencer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                  >
                    {influencer.status}
                  </Badge>
                  <div className="text-right text-sm text-slate-600">
                    <p>{influencer.contentSubmissions.length} submissions</p>
                    <p className="text-xs">
                      {influencer.contentSubmissions.filter((c: any) => c.status === 'approved').length} approved
                    </p>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ContentTab({ contentSubmissions, loading, onStatusUpdate, onRefresh }: { 
  contentSubmissions: any[]
  loading: boolean
  onStatusUpdate: (contentId: string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'PAID', feedback?: string) => void
  onRefresh: () => void
}) {
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [showContentModal, setShowContentModal] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-slate-600">Loading content submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Content Submissions</h2>
          <div className="flex items-center space-x-4 text-sm text-slate-600">
            <span>{contentSubmissions.length} total submissions</span>
            {/* Live Posts Summary */}
            {(() => {
              const totalLivePosts = contentSubmissions.reduce((sum, submission) => 
                sum + (submission.publishedPosts?.length || 0), 0
              )
              const postsWithAnalytics = contentSubmissions.reduce((sum, submission) => 
                sum + (submission.publishedPosts?.filter((post: any) => post.performance)?.length || 0), 0
              )
              return totalLivePosts > 0 ? (
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-slate-400 rounded-full" />
                  <div className="flex items-center space-x-1 text-green-600">
                    <ExternalLink className="w-3 h-3" />
                    <span>{totalLivePosts} live posts</span>
                  </div>
                  {postsWithAnalytics > 0 && (
                    <span className="text-green-700">• {postsWithAnalytics} with analytics</span>
                  )}
                </div>
              ) : null
            })()} 
          </div>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {contentSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Content Submissions</h3>
              <p className="text-slate-600">
                Content submissions will appear here when participants upload content.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {contentSubmissions.map((submission) => (
              <div 
                key={submission.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => {
                  setSelectedContent(submission)
                  setShowContentModal(true)
                }}
              >
                <div className="flex items-center space-x-4">
                  <img 
                    src={submission.influencer?.profile?.avatarUrl || '/api/placeholder/60/60'}
                    alt={`${submission.influencer?.profile?.firstName || ''} ${submission.influencer?.profile?.lastName || ''}`.trim() || 'Influencer'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-slate-900">
                        {`${submission.influencer?.profile?.firstName || ''} ${submission.influencer?.profile?.lastName || ''}`.trim() || 'Unknown'}
                      </h4>
                      {submission.influencer?.influencerProfile?.verified && <Star className="w-4 h-4 text-yellow-500" />}
                    </div>
                    <p className="text-sm text-slate-600">
                      {submission.platforms?.join(' • ') || 'No platforms'} • {submission.contentType || 'Content'}
                    </p>
                    <p className="text-xs text-slate-500">
                      Submitted {formatSafeDate(submission.submittedAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge 
                    className={
                      submission.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      submission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      submission.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      submission.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }
                  >
                    {submission.status}
                  </Badge>
                  
                  {/* Live Posts Indicator - NEW */}
                  {submission.publishedPosts && submission.publishedPosts.length > 0 && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-200">
                      <ExternalLink className="w-3 h-3" />
                      <span>{submission.publishedPosts.length} Live</span>
                      {submission.publishedPosts.some((post: any) => post.performance) && (
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" title="Analytics Available" />
                      )}
                    </div>
                  )}
                  
                  {submission.status === 'PENDING' && (
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation()
                          onStatusUpdate(submission.id, 'APPROVED')
                        }}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          onStatusUpdate(submission.id, 'REJECTED')
                        }}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedContent(submission)
                      setShowContentModal(true)
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Detail Modal */}
      {showContentModal && selectedContent && (
        <ContentDetailModal
          content={selectedContent}
          onClose={() => setShowContentModal(false)}
          onStatusChange={(contentId, newStatus, feedback) => {
            onStatusUpdate(contentId, newStatus, feedback)
            setShowContentModal(false)
          }}
        />
      )}
    </div>
  )
}

function MetricsTab({ campaign }: { campaign: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Total Impressions</h3>
              <p className="text-3xl font-bold text-primary">2.1M</p>
              <p className="text-sm text-green-600 mt-1">+25% vs last week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Engagement Rate</h3>
              <p className="text-3xl font-bold text-primary">12.3%</p>
              <p className="text-sm text-green-600 mt-1">+2.1% vs avg</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Click-through Rate</h3>
              <p className="text-3xl font-bold text-primary">3.8%</p>
              <p className="text-sm text-green-600 mt-1">+0.5% vs avg</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Performance by Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Instagram', 'TikTok', 'YouTube'].map((platform) => (
              <div key={platform} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <h3 className="font-medium text-slate-900">{platform}</h3>
                  <p className="text-sm text-slate-600">8 posts • 1.2M reach</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">15.2% engagement</p>
                  <p className="text-sm text-green-600">+3.1%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Add ContentDetailModal component
function ContentDetailModal({ content, onClose, onStatusChange }: {
  content: any
  onClose: () => void
  onStatusChange: (id: string, status: string, feedback?: string) => void
}) {
  const [feedback, setFeedback] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStatusChange = async (status: string) => {
    setIsSubmitting(true)
    try {
      await onStatusChange(content.id, status, feedback)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <img 
                src={content.influencer?.profile?.avatarUrl || content.influencer?.avatar || '/api/placeholder/60/60'} 
                alt={content.influencer?.name || 'Influencer'}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold">
                    {`${content.influencer?.profile?.firstName || ''} ${content.influencer?.profile?.lastName || ''}`.trim() || 
                     content.influencer?.name || 
                     'Influencer'}
                  </h2>
                  {(content.influencer?.verified || content.influencer?.influencerProfile?.verified) && (
                    <Star className="w-5 h-5 text-yellow-500" />
                  )}
                  <Badge className={`
                    ${content.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      content.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      content.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      content.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'} 
                    flex items-center space-x-1
                  `}>
                    <span className="capitalize">{content.status?.toLowerCase() || 'pending'}</span>
                  </Badge>
                </div>
                <p className="text-slate-600">
                  {content.influencer?.username || `@${content.influencer?.profile?.firstName?.toLowerCase() || 'user'}`}
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Content Display */}
            <div className="space-y-6">
              {/* Media Files */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Media Files</h3>
                  {content.files && content.files.length > 0 && (
                    <span className="text-sm text-slate-600">{content.files.length} file(s)</span>
                  )}
                </div>
                
                {content.files && content.files.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main media display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {content.files.map((file: any, index: number) => (
                        <div key={file.id || index} className="group relative">
                          {file.fileType?.startsWith('image/') ? (
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer hover:opacity-95 transition-opacity">
                              <img 
                                src={file.thumbnailUrl || file.fileUrl} 
                                alt={`Content ${index + 1}`}
                                className="w-full h-full object-cover" 
                                onClick={() => setSelectedImageIndex(index)}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ) : file.fileType?.startsWith('video/') ? (
                            <div className="aspect-video rounded-lg overflow-hidden bg-slate-200 relative">
                              <video 
                                src={file.fileUrl}
                                className="w-full h-full object-cover"
                                controls
                                poster={file.thumbnailUrl}
                              />
                            </div>
                          ) : (
                            <div className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                              <div className="text-center">
                                <Download className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm text-slate-600">
                                  {file.fileType?.split('/')[1]?.toUpperCase() || 'File'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {file.fileSize ? contentService.formatFileSize(file.fileSize) : 'Unknown size'}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* File info overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 rounded-b-lg">
                            <div className="flex items-center justify-between text-white">
                              <span className="text-xs font-medium">
                                {file.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
                              </span>
                              <Button variant="ghost" size="sm" asChild className="h-6 px-2 text-white hover:bg-white/20">
                                <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-3 h-3" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* File list */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-3">All Files</h4>
                      <div className="space-y-2">
                        {content.files.map((file: any, index: number) => (
                          <div key={file.id || index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center">
                                {file.fileType?.startsWith('image/') ? (
                                  <Camera className="w-4 h-4 text-slate-500" />
                                ) : file.fileType?.startsWith('video/') ? (
                                  <Play className="w-4 h-4 text-slate-500" />
                                ) : (
                                  <Download className="w-4 h-4 text-slate-500" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-700">
                                  {file.fileType || 'Unknown type'} • {file.fileSize ? contentService.formatFileSize(file.fileSize) : 'Unknown size'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Uploaded {file.createdAt ? formatSafeDate(file.createdAt) : 'Unknown date'}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-8 rounded-lg text-center border-2 border-dashed border-slate-300">
                    <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">No media files uploaded</p>
                    <p className="text-slate-500 text-sm">The influencer hasn't uploaded any content files yet.</p>
                  </div>
                )}
              </div>

              {/* Content Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Content Information</h3>
                </div>

                {/* Title */}
                {content.title && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <p className="text-slate-800">{content.title}</p>
                    </div>
                  </div>
                )}

                {/* Description */}
                {content.description && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <p className="text-slate-800">{content.description}</p>
                    </div>
                  </div>
                )}

                {/* Caption */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Caption</label>
                  <div className="bg-slate-50 p-3 rounded-lg border">
                    <p className="text-slate-800 whitespace-pre-wrap">
                      {content.caption || 'No caption provided'}
                    </p>
                  </div>
                </div>

                {/* Content Type & Platforms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Content Type</label>
                    <Badge variant="secondary" className="text-sm">
                      {content.contentType || 'Not specified'}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Platforms</label>
                    <div className="flex flex-wrap gap-1">
                      {content.platforms && content.platforms.length > 0 ? (
                        content.platforms.map((platform: string) => (
                          <Badge key={platform} variant="outline" className="text-sm">
                            {platform}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-slate-500 text-sm">No platforms specified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live URLs Section - NEW */}
                {content.publishedPosts && content.publishedPosts.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Live Posts & Analytics</label>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-green-900">
                          📊 {content.publishedPosts.length} Live Post{content.publishedPosts.length !== 1 ? 's' : ''}
                        </span>
                        <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                          Analytics Available
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {content.publishedPosts.map((post: any, index: number) => (
                          <div key={post.id || index} className="bg-white border border-green-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {post.platform}
                                </Badge>
                                <span className="text-sm font-medium text-green-800">
                                  {post.postType || 'POST'}
                                </span>
                                <span className="text-xs text-green-600">
                                  {formatSafeDate(post.publishedAt)}
                                </span>
                              </div>
                              <Button variant="ghost" size="sm" asChild className="h-6 px-2">
                                <a 
                                  href={post.postUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </Button>
                            </div>
                            
                            {post.performance && (
                              <div className="grid grid-cols-4 gap-3 mt-2 text-xs text-green-700">
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{post.performance.views?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Heart className="w-3 h-3" />
                                  <span>{post.performance.likes?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MessageCircle className="w-3 h-3" />
                                  <span>{post.performance.comments?.toLocaleString() || '0'}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Share2 className="w-3 h-3" />
                                  <span>{post.performance.shares?.toLocaleString() || '0'}</span>
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-2 text-xs text-slate-500 truncate">
                              <strong>URL:</strong> {post.postUrl}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Total Analytics Summary */}
                      {content.publishedPosts.some((post: any) => post.performance) && (
                        <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-300">
                          <div className="text-sm font-medium text-green-900 mb-2">📈 Total Performance</div>
                          <div className="grid grid-cols-4 gap-3 text-sm text-green-700">
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <Eye className="w-4 h-4" />
                                <span className="font-semibold">
                                  {content.publishedPosts
                                    .reduce((sum: number, post: any) => sum + (post.performance?.views || 0), 0)
                                    .toLocaleString()}
                                </span>
                              </div>
                              <div className="text-xs text-green-600">Views</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <Heart className="w-4 h-4" />
                                <span className="font-semibold">
                                  {content.publishedPosts
                                    .reduce((sum: number, post: any) => sum + (post.performance?.likes || 0), 0)
                                    .toLocaleString()}
                                </span>
                              </div>
                              <div className="text-xs text-green-600">Likes</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <MessageCircle className="w-4 h-4" />
                                <span className="font-semibold">
                                  {content.publishedPosts
                                    .reduce((sum: number, post: any) => sum + (post.performance?.comments || 0), 0)
                                    .toLocaleString()}
                                </span>
                              </div>
                              <div className="text-xs text-green-600">Comments</div>
                            </div>
                            <div className="text-center">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                <Share2 className="w-4 h-4" />
                                <span className="font-semibold">
                                  {content.publishedPosts
                                    .reduce((sum: number, post: any) => sum + (post.performance?.shares || 0), 0)
                                    .toLocaleString()}
                                </span>
                              </div>
                              <div className="text-xs text-green-600">Shares</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Hashtags */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Hashtags</label>
                  <div className="flex flex-wrap gap-1">
                    {content.hashtags && content.hashtags.length > 0 ? (
                      content.hashtags.map((hashtag: string) => (
                        <Badge key={hashtag} variant="outline" className="text-xs">
                          {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-slate-500 text-sm">No hashtags provided</span>
                    )}
                  </div>
                </div>

                {/* Amount */}
                {content.amount && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Proposed Amount</label>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-lg font-bold text-green-700">${content.amount.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {/* Submission Timeline */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Timeline</label>
                  <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                    {content.submittedAt && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span>Submitted: {formatSafeDate(content.submittedAt)}</span>
                      </div>
                    )}
                    {content.approvedAt && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Approved: {formatSafeDate(content.approvedAt)}</span>
                      </div>
                    )}
                    {content.completedAt && (
                      <div className="flex items-center space-x-2 text-sm text-blue-600">
                        <Edit3 className="w-4 h-4" />
                        <span>Completed: {formatSafeDate(content.completedAt)}</span>
                      </div>
                    )}
                    {content.paidAt && (
                      <div className="flex items-center space-x-2 text-sm text-purple-600">
                        <Star className="w-4 h-4" />
                        <span>Paid: {formatSafeDate(content.paidAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Previous Feedback */}
                {content.feedback && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Previous Feedback</label>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-yellow-800">{content.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Review Actions */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Review Actions</h3>
                
                {/* Current Status */}
                <div className="bg-slate-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Current Status</p>
                      <Badge className={`
                        ${content.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          content.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          content.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          content.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'} 
                        flex items-center space-x-1 w-fit
                      `}>
                        <span className="capitalize">{content.status?.toLowerCase() || 'pending'}</span>
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Feedback Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Feedback for Influencer
                    </label>
                    <textarea
                      placeholder="Provide detailed feedback about the content submission..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full h-32 p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      This feedback will be sent to the influencer along with your decision.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {(!content.status || content.status === 'PENDING') ? (
                    <div className="grid grid-cols-1 gap-3">
                      <Button 
                        onClick={() => handleStatusChange('APPROVED')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={isSubmitting}
                        size="lg"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5 mr-2" />
                        )}
                        Approve Content
                      </Button>
                      
                      <Button 
                        onClick={() => handleStatusChange('REJECTED')}
                        variant="destructive"
                        disabled={isSubmitting}
                        size="lg"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="w-5 h-5 mr-2" />
                        )}
                        Reject Content
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-600 mb-3">
                        This content has been <span className="font-medium">{content.status?.toLowerCase()}</span>.
                      </p>
                      {content.status === 'APPROVED' && (
                        <p className="text-sm text-green-600 mb-4">
                          Content is ready for publication by the influencer.
                        </p>
                      )}
                      {content.status === 'REJECTED' && (
                        <p className="text-sm text-red-600 mb-4">
                          Content was rejected and needs to be resubmitted.
                        </p>
                      )}
                      {content.status === 'APPROVED' && content.files && content.files.length > 0 && (
                        <Button variant="outline" className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download All Files
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImageIndex !== null && content.files && content.files[selectedImageIndex] && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={content.files[selectedImageIndex].fileUrl}
              alt={`Content preview ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            <Button 
              variant="ghost" 
              className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setSelectedImageIndex(null)}
            >
              <XCircle className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


