import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  TrendingUp, 
  Eye, 
  Calendar, 
  DollarSign, 
  Star,
  Bell,
  Settings,
  BarChart3,
  Camera,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Search,
  Upload,
  Target,
  Mail
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logoutUser } from '../../store/slices/authSlice'
import NotificationSystem from '../../components/notifications/NotificationSystem'
import { dashboardService, InfluencerDashboardData } from '../../services/dashboard.service'
import { apiClient, getFullUrl } from '../../lib/api'
import { usersService } from '../../services/users.service'

// Enhanced earnings data from backend
interface InfluencerEarningsData {
  summary: {
    totalEarned: number
    totalPaid: number
    pendingAmount: number
    lastPayoutAt?: string
  }
  recentPayments: Array<{
    id: string
    amount: number
    netAmount: number
    status: string
    processedAt?: string
    createdAt: string
    campaign?: {
      id: string
      title: string
    }
  }>
  monthlyEarnings: Array<{
    month: string
    earnings: number
  }>
}

// Enhanced campaign data from backend
interface InfluencerCampaignData {
  id: string
  title: string
  status: string
  objective: string
  budget?: number
  startDate: string
  endDate: string
  brand: {
    id: string
    name: string
    company: string
    logo?: string
  }
  participantStatus: string
  myContentCount: number
  totalParticipants: number
  totalContent: number
  joinedAt: string
  createdAt: string
}

export default function InfluencerDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState<InfluencerDashboardData | null>(null)
  const [earningsData, setEarningsData] = useState<InfluencerEarningsData | null>(null)
  const [campaignsData, setCampaignsData] = useState<InfluencerCampaignData[]>([])
  const [activitiesData, setActivitiesData] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Load all dashboard data in parallel
      const [overviewData, earningsResponse, campaignsResponse, userResponse] = await Promise.all([
        dashboardService.getInfluencerDashboard(),
        apiClient.get('/dashboard/influencer/earnings'),
        apiClient.get('/dashboard/influencer/campaigns?limit=5'),
        usersService.getCurrentUser()
      ])
      
      setDashboardData(overviewData)
      setEarningsData(earningsResponse.data)
      setCampaignsData(campaignsResponse.data)
      setCurrentUser(userResponse)
      
      // Generate recent activities from earnings and campaigns
      const recentActivities = [
        ...(earningsResponse.data.recentPayments || []).slice(0, 3).map((payment: any) => ({
          id: `payment_${payment.id}`,
          type: 'payment_received',
          title: 'Payment Received',
          description: `Payment of ${formatCurrency(payment.netAmount)} has been processed${payment.campaign ? ` for ${payment.campaign.title}` : ''}`,
          timestamp: formatTimeAgo(payment.processedAt || payment.createdAt),
          amount: payment.netAmount
        })),
        ...(campaignsResponse.data || []).slice(0, 2).map((campaign: any) => ({
          id: `campaign_${campaign.id}`,
          type: 'campaign_joined',
          title: 'Campaign Joined',
          description: `You joined the ${campaign.title} campaign by ${campaign.brand.company}`,
          timestamp: formatTimeAgo(campaign.joinedAt),
        }))
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5)
      
      setActivitiesData(recentActivities)
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data')
      console.error('Dashboard error:', err)
      
      // Fallback to mock data for development
      const mockData: InfluencerDashboardData = {
        earnings: {
          total: 2500,
          thisMonth: 800,
          lastMonth: 650,
          pending: 250,
          growth: 23
        },
        campaigns: {
          active: 3,
          completed: 8,
          applications: 2,
          invitations: 1
        },
        performance: {
          reach: '150K',
          engagement: '8.4%',
          avgViews: '12K',
          totalContent: 24
        },
        socialStats: {
          totalFollowers: 532000,
          avgEngagement: '8.4%',
          topPlatform: 'Instagram',
          growth: 15
        },
        activeCampaigns: [
          {
            id: '1',
            title: 'Summer Skincare Launch',
            brand: 'NIVEA Kenya',
            status: 'active',
            deadline: '2024-05-15',
            earning: 250,
            progress: 75
          },
          {
            id: '2',
            title: 'Tech Product Review',
            brand: 'Samsung East Africa',
            status: 'active',
            deadline: '2024-05-20',
            earning: 300,
            progress: 45
          }
        ],
        recentActivities: [
          {
            id: '1',
            type: 'content_approved',
            title: 'Content Approved',
            description: 'Your Instagram post for NIVEA campaign was approved',
            timestamp: '2 hours ago'
          },
          {
            id: '2',
            type: 'payment_received',
            title: 'Payment Received',
            description: 'Payment of $250 has been processed',
            amount: 250,
            timestamp: '1 day ago'
          }
        ],
        contentStatus: {
          submitted: 15,
          approved: 12,
          pending: 2,
          rejected: 1
        }
      }
      
      const mockEarnings: InfluencerEarningsData = {
        summary: {
          totalEarned: 12500,
          totalPaid: 9800,
          pendingAmount: 2700,
        },
        recentPayments: [
          {
            id: '1',
            amount: 500,
            netAmount: 450,
            status: 'COMPLETED',
            processedAt: '2024-01-15T10:00:00Z',
            createdAt: '2024-01-10T10:00:00Z',
            campaign: {
              id: '1',
              title: 'Summer Collection'
            }
          }
        ],
        monthlyEarnings: [
          { month: 'Jan 2024', earnings: 2400 },
          { month: 'Feb 2024', earnings: 1800 },
          { month: 'Mar 2024', earnings: 2200 },
          { month: 'Apr 2024', earnings: 3100 },
          { month: 'May 2024', earnings: 2700 },
          { month: 'Jun 2024', earnings: 1800 }
        ]
      }
      
      const mockCampaigns: InfluencerCampaignData[] = [
        {
          id: '1',
          title: 'Summer Fashion Trends',
          status: 'ACTIVE',
          objective: 'Brand Awareness',
          budget: 5000,
          startDate: '2024-07-01T00:00:00Z',
          endDate: '2024-08-15T00:00:00Z',
          brand: {
            id: '1',
            name: 'NIVEA Kenya',
            company: 'NIVEA Kenya',
            logo: '/api/placeholder/40/40'
          },
          participantStatus: 'ACTIVE',
          myContentCount: 2,
          totalParticipants: 12,
          totalContent: 18,
          joinedAt: '2024-07-10T10:00:00Z',
          createdAt: '2024-06-20T10:00:00Z'
        },
        {
          id: '2',
          title: 'Fitness Challenge Campaign',
          status: 'ACTIVE',
          objective: 'Product Promotion',
          budget: 3500,
          startDate: '2024-07-15T00:00:00Z',
          endDate: '2024-08-30T00:00:00Z',
          brand: {
            id: '2',
            name: 'SportPesa',
            company: 'SportPesa Kenya',
            logo: '/api/placeholder/40/40'
          },
          participantStatus: 'ACTIVE',
          myContentCount: 1,
          totalParticipants: 8,
          totalContent: 12,
          joinedAt: '2024-07-20T14:00:00Z',
          createdAt: '2024-07-01T10:00:00Z'
        }
      ]
      
      console.log('Using fallback mock data due to API error')
      setDashboardData(mockData)
      setEarningsData(mockEarnings)
      setCampaignsData(mockCampaigns)
      
      // Generate mock activities
      const mockActivities = [
        {
          id: 'activity_1',
          type: 'payment_received',
          title: 'Payment Received',
          description: 'Payment of $450 has been processed for Summer Collection',
          timestamp: '2 hours ago',
          amount: 450
        },
        {
          id: 'activity_2',
          type: 'campaign_joined',
          title: 'Campaign Joined',
          description: 'You joined the Fitness Challenge Campaign by SportPesa Kenya',
          timestamp: '1 day ago'
        },
        {
          id: 'activity_3',
          type: 'content_approved',
          title: 'Content Approved',
          description: 'Your Instagram post for Summer Fashion Trends was approved',
          timestamp: '2 days ago'
        }
      ]
      
      setActivitiesData(mockActivities)
    } finally {
      setLoading(false)
    }
  }

  // Utility functions
  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString()}`
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Creator Dashboard</h1>
            <p className="text-slate-600">Track your campaigns and earnings</p>
          </div>
          
          {/* Add notifications to header */}
          <div className="flex items-center space-x-4">
            <NotificationSystem userRole="influencer" />
            
            {/* User profile section */}
            <div className="flex items-center space-x-3">
              <img 
                src={getFullUrl(currentUser?.profile?.avatarUrl)} 
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">
                  {currentUser?.profile?.firstName && currentUser?.profile?.lastName 
                    ? `${currentUser.profile.firstName} ${currentUser.profile.lastName}`
                    : 'Influencer Name'
                  }
                </p>
                <p className="text-xs text-slate-600">
                  @{currentUser?.profile?.firstName?.toLowerCase() || 'username'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Navigation Sidebar */}
        <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-slate-200 p-6">
          <nav className="space-y-2">
            <NavItem icon={BarChart3} label="Dashboard" active={true} />
            <NavItem icon={Target} label="My Applications" onClick={() => navigate('/campaigns/my-applications')} />
            <NavItem icon={Search} label="Browse Campaigns" onClick={() => navigate('/campaigns/browse')} />
            <NavItem icon={Camera} label="Content Library" onClick={() => navigate('/content')} />
            <NavItem icon={DollarSign} label="Earnings" onClick={() => navigate('/earnings')} />
            <NavItem icon={TrendingUp} label="Analytics" onClick={() => navigate('/analytics')} />
            <NavItem icon={Mail} label="Inquiries" onClick={() => navigate('/inquiries')} />
            <NavItem icon={Settings} label="Settings" onClick={() => navigate('/settings')} />
          </nav>

          {/* Quick Actions in Sidebar */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button size="sm" className="w-full justify-start" onClick={() => navigate('/campaigns/browse')}>
                <Search className="w-4 h-4 mr-2" />
                Browse Campaigns
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => navigate('/campaigns/my-applications')}>
                <Target className="w-4 h-4 mr-2" />
                My Applications
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => navigate('/content/submit')}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Content
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => navigate('/analytics')}>
                <Eye className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Enhanced Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Earnings"
              value={earningsData?.summary.totalEarned ? formatCurrency(earningsData.summary.totalEarned) : '$0'}
              icon={DollarSign}
              trend={`${dashboardData?.earnings?.growth || 0}% growth`}
              color="bg-green-500"
            />
            <StatsCard
              title="Pending Amount"
              value={earningsData?.summary.pendingAmount ? formatCurrency(earningsData.summary.pendingAmount) : '$0'}
              icon={Clock}
              trend={`${dashboardData?.campaigns?.active || 0} active campaigns`}
              color="bg-yellow-500"
            />
            <StatsCard
              title="Total Reach"
              value={dashboardData?.performance?.reach || '0'}
              icon={Eye}
              trend={`${dashboardData?.performance?.avgViews || '0'} avg views`}
              color="bg-blue-500"
            />
            <StatsCard
              title="Engagement Rate"
              value={dashboardData?.performance?.engagement || '0%'}
              icon={TrendingUp}
              trend={`${dashboardData?.socialStats?.growth || 0}% growth`}
              color="bg-purple-500"
            />
          </div>

          {/* Monthly Earnings Trend */}
          {earningsData?.monthlyEarnings && earningsData.monthlyEarnings.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Monthly Earnings Trend</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/earnings')}>
                  View Details
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {earningsData.monthlyEarnings.slice(-6).map((monthData, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <h3 className="font-medium text-slate-900">{monthData.month}</h3>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(monthData.earnings)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Campaigns & Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Active Campaigns */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Active Campaigns</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/campaigns/my-applications')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignsData.filter(campaign => campaign.status === 'ACTIVE' || campaign.participantStatus === 'ACTIVE').slice(0, 3).map((campaign) => {
                    const isActive = campaign.status === 'ACTIVE' || campaign.participantStatus === 'ACTIVE'
                    const daysUntilEnd = campaign.endDate ? Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
                    const progress = campaign.myContentCount && campaign.myContentCount > 0 ? Math.min(100, (campaign.myContentCount / Math.max(campaign.myContentCount + 1, 3)) * 100) : 25
                    
                    return (
                      <div key={campaign.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900">{campaign.title}</h4>
                          <Badge variant={isActive ? 'default' : 'secondary'}>
                            {campaign.participantStatus || campaign.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{campaign.brand.company}</p>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-500">
                            {daysUntilEnd > 0 ? `${daysUntilEnd} days left` : 'Ended'}
                          </span>
                          <span className="text-slate-600">
                            {campaign.myContentCount || 0} content submitted
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{Math.round(progress)}% progress</p>
                        </div>
                      </div>
                    )
                  })}
                  {campaignsData.filter(campaign => campaign.status === 'ACTIVE' || campaign.participantStatus === 'ACTIVE').length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No active campaigns</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/campaigns/browse')}>
                        Browse Campaigns
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activitiesData.map((activity) => {
                    const getActivityIcon = (type: string) => {
                      switch (type) {
                        case 'payment_received': return DollarSign
                        case 'campaign_joined': return Target
                        case 'content_approved': return CheckCircle
                        default: return Bell
                      }
                    }
                    
                    const getActivityColor = (type: string) => {
                      switch (type) {
                        case 'payment_received': return 'text-green-500'
                        case 'campaign_joined': return 'text-blue-500'
                        case 'content_approved': return 'text-emerald-500'
                        default: return 'text-indigo-500'
                      }
                    }
                    
                    const ActivityIcon = getActivityIcon(activity.type)
                    
                    return (
                      <div key={activity.id} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)} bg-slate-100`}>
                          <ActivityIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{activity.title}</h4>
                          <p className="text-sm text-slate-600">{activity.description}</p>
                          <p className="text-xs text-slate-500">{activity.timestamp}</p>
                        </div>
                        {activity.amount && (
                          <span className="font-semibold text-green-600">+{formatCurrency(activity.amount)}</span>
                        )}
                      </div>
                    )
                  })}
                  {activitiesData.length === 0 && (
                    <div className="text-center py-8 text-slate-500">
                      <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                      <p>No recent activities</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Earnings & Performance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Earned</span>
                    <span className="font-semibold">
                      {earningsData?.summary.totalEarned ? formatCurrency(earningsData.summary.totalEarned) : '$0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Paid</span>
                    <span className="font-semibold text-green-600">
                      {earningsData?.summary.totalPaid ? formatCurrency(earningsData.summary.totalPaid) : '$0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pending</span>
                    <span className="font-semibold text-yellow-600">
                      {earningsData?.summary.pendingAmount ? formatCurrency(earningsData.summary.pendingAmount) : '$0'}
                    </span>
                  </div>
                  {earningsData?.summary.lastPayoutAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Last Payout</span>
                      <span className="text-slate-700">
                        {new Date(earningsData.summary.lastPayoutAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Content Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Submitted</span>
                    <span className="font-semibold">{dashboardData?.contentStatus?.submitted || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Approved</span>
                    <span className="font-semibold text-green-600">{dashboardData?.contentStatus?.approved || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pending</span>
                    <span className="font-semibold text-yellow-600">{dashboardData?.contentStatus?.pending || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Rejected</span>
                    <span className="font-semibold text-red-600">{dashboardData?.contentStatus?.rejected || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-900">
                  <Upload className="w-5 h-5" />
                  <span>Content Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-blue-800 mb-4">
                  Ready to track your post performance?
                </div>
                <Button 
                  onClick={() => navigate('/content/manage')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Live Post URLs
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate('/campaigns/browse')}
                    className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Search className="w-3 h-3 mr-1" />
                    Browse Campaigns
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/analytics/influencer')}
                    className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <BarChart3 className="w-3 h-3 mr-1" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

// Helper Components
function NavItem({ icon: Icon, label, active = false, onClick }: { 
  icon: any, 
  label: string, 
  active?: boolean,
  onClick?: () => void
}) {
  return (
    <button 
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
        active 
          ? 'bg-primary text-primary-foreground' 
          : 'text-slate-700 hover:bg-slate-100'
      }`}
      onClick={onClick}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  )
}

function StatsCard({ title, value, icon: Icon, trend, color = "bg-slate-500" }: {
  title: string,
  value: string,
  icon: any,
  trend: string,
  color?: string
}) {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-600 mt-1">{trend}</p>
          </div>
          <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MetricCard({ label, value, icon: Icon }: {
  label: string,
  value: string,
  icon: any
}) {
  return (
    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
      <div>
        <p className="text-sm text-slate-600">{label}</p>
        <p className="text-xl font-bold text-slate-900">{value}</p>
      </div>
      <Icon className="w-6 h-6 text-slate-400" />
    </div>
  )
}

function OverviewCard({ title, value, subtitle, icon, trend }: {
  title: string,
  value: string | number,
  subtitle?: string,
  icon: React.ReactNode,
  trend?: string
}) {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-slate-600">{title}</div>
          <div className="text-xs text-slate500">{trend}</div>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className="text-slate-400">{icon}</div>
        </div>
        {subtitle && (
          <div className="mt-1 text-sm text-slate-600">{subtitle}</div>
        )}
      </CardContent>
    </Card>
  )
}

function ActionCard({ title, description, icon, onClick }: {
  title: string,
  description: string,
  icon: React.ReactNode,
  onClick: () => void
}) {
  return (
    <Card 
      className="shadow-lg border-0 bg-white/80 backdrop-blur-sm cursor-pointer"
      onClick={onClick}
    >
      <CardContent>
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mr-4">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-600">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
