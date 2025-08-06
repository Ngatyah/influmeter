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
  CheckCircle,
  XCircle,
  Edit3,
  Eye,
  Camera,
  Play,
  AlertTriangle,
  MoreHorizontal,
  TrendingUp,
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'influencers', label: 'Influencers' },
  { id: 'content', label: 'Content Approvals' },
  { id: 'metrics', label: 'Metrics' },
]


export default function CampaignDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('overview')
  const [showContentModal, setShowContentModal] = useState(false)
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [showInfluencerModal, setShowInfluencerModal] = useState(false)
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null)

  // Mock campaign data - in real app, fetch based on ID
  const campaign = {
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
  const contentSubmissions = [
    {
      id: '1',
      influencer: {
        name: 'Murugi Munyi',
        username: '@murugimunyi',
        avatar: '/api/placeholder/60/60',
        verified: true
      },
      content: {
        type: 'image',
        files: ['/api/placeholder/400/400'],
        caption: 'Just tried the new @niveakenya summer collection! 🌞 My skin feels so hydrated and protected. Perfect for our Kenyan sun! #NIVEASummer #NaturalGlow #SkincareRoutine',
        platforms: ['Instagram', 'TikTok'],
        hashtags: ['#NIVEASummer', '#NaturalGlow', '#SkincareRoutine']
      },
      submittedAt: '2024-04-20T10:30:00Z',
      status: 'pending'
    },
    {
      id: '2',
      influencer: {
        name: 'Sarah Johnson',
        username: '@sarahjohnson',
        avatar: '/api/placeholder/60/60',
        verified: false
      },
      content: {
        type: 'video',
        files: ['/api/placeholder/400/600'],
        caption: 'Testing the amazing skincare routine! Love how my skin feels ✨ #NIVEASummer #SkincareRoutine',
        platforms: ['TikTok', 'Instagram'],
        hashtags: ['#NIVEASummer', '#SkincareRoutine']
      },
      submittedAt: '2024-04-19T14:20:00Z',
      status: 'approved'
    },
    {
      id: '3',
      influencer: {
        name: 'David Kim',
        username: '@davidkim',
        avatar: '/api/placeholder/60/60',
        verified: false
      },
      content: {
        type: 'image',
        files: ['/api/placeholder/400/500'],
        caption: 'Morning skincare routine with @niveakenya products! Perfect start to the day 🌅 #NIVEASummer #MorningRoutine',
        platforms: ['Instagram'],
        hashtags: ['#NIVEASummer', '#MorningRoutine']
      },
      submittedAt: '2024-04-18T09:15:00Z',
      status: 'rejected'
    }
  ]

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
                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                  {campaign.status}
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
            <Button variant="outline">
              {campaign.status === 'active' ? (
                <>
                  <Play className="w-4 h-4 mr-2" />
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
          {activeTab === 'influencers' && <InfluencersTab campaign={campaign} />}
          {activeTab === 'content' && <ContentTab campaign={campaign} />}
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
                  {campaign.influencersJoined}/{campaign.targetInfluencers}
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
                <p className="text-sm text-slate-600">Total Reach</p>
                <p className="text-2xl font-bold text-slate-900">{campaign.totalReach}</p>
              </div>
              <Eye className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Engagement Rate</p>
                <p className="text-2xl font-bold text-slate-900">{campaign.engagement}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Budget Spent</p>
                <p className="text-2xl font-bold text-slate-900">{campaign.budget}</p>
              </div>
              <DollarSign className="w-8 h-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>
      </div>

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
                <p className="text-slate-900">{campaign.startDate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">End Date</label>
                <p className="text-slate-900">{campaign.endDate}</p>
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
              <span className="font-semibold">{campaign.contentSubmitted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Content Approved</span>
              <span className="font-semibold text-green-600">{campaign.contentApproved}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Pending Review</span>
              <span className="font-semibold text-yellow-600">
                {campaign.contentSubmitted - campaign.contentApproved}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InfluencersTab({ campaign }: { campaign: any }) {
  const navigate = useNavigate()

  const influencers = [
    { id: 1, name: 'Murugi Munyi', followers: '532K', engagement: '8.4%', status: 'active', joined: '2024-04-16' },
    { id: 2, name: 'Sarah Johnson', followers: '245K', engagement: '12.1%', status: 'active', joined: '2024-04-17' },
    { id: 3, name: 'David Kim', followers: '128K', engagement: '15.2%', status: 'pending', joined: '2024-04-18' },
  ]

  // Get participatingInfluencers from the parent component scope
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
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Participating Influencers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {participatingInfluencers.map((influencer) => (
              <div 
                key={influencer.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => {
                  // Replace modal with navigation to new page
                  navigate(`/campaigns/${campaign.id}/influencer/${influencer.id}`)
                }}
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
                      Joined {new Date(influencer.joinedDate).toLocaleDateString()}
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
        </CardContent>
      </Card>
    </div>
  )
}

function ContentTab({ campaign }: { campaign: any }) {
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [showContentModal, setShowContentModal] = useState(false)

  const submissions = [
    { 
      id: 1, 
      influencer: 'Murugi Munyi', 
      platform: 'Instagram', 
      type: 'Post', 
      status: 'pending',
      submitted: '2024-04-20',
      preview: '/api/placeholder/200/200'
    },
    { 
      id: 2, 
      influencer: 'Sarah Johnson', 
      platform: 'TikTok', 
      type: 'Video', 
      status: 'approved',
      submitted: '2024-04-19',
      preview: '/api/placeholder/200/200'
    },
    { 
      id: 3, 
      influencer: 'David Kim', 
      platform: 'Instagram', 
      type: 'Story', 
      status: 'rejected',
      submitted: '2024-04-18',
      preview: '/api/placeholder/200/200'
    },
  ]

  // Get contentSubmissions from parent component scope
  const contentSubmissions = [
    {
      id: '1',
      influencer: {
        name: 'Murugi Munyi',
        username: '@murugimunyi',
        avatar: '/api/placeholder/60/60',
        verified: true
      },
      content: {
        type: 'image',
        files: ['/api/placeholder/400/400'],
        caption: 'Just tried the new @niveakenya summer collection! 🌞 My skin feels so hydrated and protected. Perfect for our Kenyan sun! #NIVEASummer #NaturalGlow #SkincareRoutine',
        platforms: ['Instagram', 'TikTok'],
        hashtags: ['#NIVEASummer', '#NaturalGlow', '#SkincareRoutine']
      },
      submittedAt: '2024-04-20T10:30:00Z',
      status: 'pending'
    },
    {
      id: '2',
      influencer: {
        name: 'Sarah Johnson',
        username: '@sarahjohnson',
        avatar: '/api/placeholder/60/60',
        verified: false
      },
      content: {
        type: 'video',
        files: ['/api/placeholder/400/600'],
        caption: 'Testing the amazing skincare routine! Love how my skin feels ✨ #NIVEASummer #SkincareRoutine',
        platforms: ['TikTok', 'Instagram'],
        hashtags: ['#NIVEASummer', '#SkincareRoutine']
      },
      submittedAt: '2024-04-19T14:20:00Z',
      status: 'approved'
    }
  ]

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Content Submissions</CardTitle>
        </CardHeader>
        <CardContent>
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
                    src={submission.influencer.avatar} 
                    alt={submission.influencer.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-slate-900">{submission.influencer.name}</h4>
                      {submission.influencer.verified && <Star className="w-4 h-4 text-yellow-500" />}
                    </div>
                    <p className="text-sm text-slate-600">
                      {submission.content.platforms.join(' • ')} • {submission.content.type}
                    </p>
                    <p className="text-xs text-slate-500">
                      Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={
                      submission.status === 'approved' ? 'default' : 
                      submission.status === 'pending' ? 'secondary' : 
                      'destructive'
                    }
                    className={
                      submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                      submission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {submission.status}
                  </Badge>
                  
                  {/* Remove inline buttons - content will be opened in modal */}
                  <Button size="sm" variant="outline">
                    <Eye className="w-3 h-3 mr-1" />
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
  onStatusChange: (id: string, status: string) => void
}) {
  const [feedback, setFeedback] = useState('')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <img 
                src={content.influencer.avatar} 
                alt={content.influencer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold">{content.influencer.name}</h2>
                  {content.influencer.verified && <Star className="w-5 h-5 text-yellow-500" />}
                </div>
                <p className="text-slate-600">{content.influencer.username}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Display */}
            <div>
              <h3 className="font-semibold mb-3">Content Preview</h3>
              
              <div className="mb-4">
                {content.content.type === 'image' ? (
                  <img 
                    src={content.content.files[0]} 
                    alt="Content" 
                    className="w-full rounded-lg object-cover max-h-96"
                  />
                ) : (
                  <div className="aspect-video rounded-lg bg-slate-200 flex items-center justify-center">
                    <div className="text-center">
                      <Play className="w-16 h-16 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-600">Video Content</p>
                    </div>
                  </div>
                )}
              </div>

              <h3 className="font-semibold mb-2">Caption</h3>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg mb-4">
                {content.content.caption}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Platforms</h4>
                  <div className="flex flex-wrap gap-1">
                    {content.content.platforms.map((platform: string) => (
                      <Badge key={platform} variant="secondary">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Hashtags</h4>
                  <div className="flex flex-wrap gap-1">
                    {content.content.hashtags.map((hashtag: string) => (
                      <Badge key={hashtag} variant="outline" className="text-xs">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Submitted:</strong> {new Date(content.submittedAt).toLocaleDateString()} at {new Date(content.submittedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>

            {/* Review Actions */}
            <div>
              <h3 className="font-semibold mb-3">Review Actions</h3>
              
              <div className="mb-4">
                <div className={`p-3 rounded-lg ${
                  content.status === 'approved' ? 'bg-green-50 border border-green-200' :
                  content.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    {content.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {content.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                    {content.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
                    <span className={`font-semibold capitalize ${
                      content.status === 'approved' ? 'text-green-800' :
                      content.status === 'pending' ? 'text-yellow-800' :
                      'text-red-800'
                    }`}>
                      {content.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {content.status === 'pending' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Feedback (Optional)
                    </label>
                    <textarea
                      placeholder="Provide feedback for the influencer..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full h-24 p-3 border border-slate-200 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      onClick={() => onStatusChange(content.id, 'approved')}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Content
                    </Button>
                    
                    <Button 
                      onClick={() => onStatusChange(content.id, 'revision_requested')}
                      variant="outline"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Request Revisions
                    </Button>
                    
                    <Button 
                      onClick={() => onStatusChange(content.id, 'rejected')}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Content
                    </Button>
                  </div>
                </div>
              )}

              {content.status !== 'pending' && (
                <div className="text-center py-8">
                  <p className="text-slate-600 mb-4">
                    This content has been {content.status}.
                  </p>
                  {content.status === 'approved' && (
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Content
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


