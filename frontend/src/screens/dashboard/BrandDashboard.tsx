import React, { useEffect, useState } from 'react'
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
  Plus,
  Target,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logoutUser } from '../../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import NotificationSystem from '../../components/notifications/NotificationSystem'
import { dashboardService } from '../../services/dashboard.service'
import { apiClient } from '../../lib/api'

// Enhanced backend response type
interface BrandDashboardBackendData {
  totalCampaigns: number
  activeCampaigns: number
  totalContentSubmissions: number
  topInfluencers: Array<{
    id: string
    name: string
    handle: string
    profilePicture?: string
    totalSubmissions: number
  }>
}

// Enhanced analytics data type
interface BrandAnalyticsData {
  overview: {
    totalCampaigns: number
    activeCampaigns: number
    totalInfluencers: number
    totalContentSubmissions: number
    totalReach: number
    totalImpressions: number
    totalEngagement: number
    avgEngagementRate: number
    totalSpent: number
    totalPayments: number
  }
  topCampaigns: Array<{
    id: string
    title: string
    reach: number
    engagement: number
    engagementRate: number
    participantsCount: number
    contentCount: number
  }>
  roi: {
    totalSpent: number
    totalReach: number
    totalEngagement: number
    costPerReach: number
    costPerEngagement: number
    engagementRate: number
  }
}

export default function BrandDashboard() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const [dashboardData, setDashboardData] = useState<BrandDashboardBackendData | null>(null)
  const [analyticsData, setAnalyticsData] = useState<BrandAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const handleLogout = () => {
    dispatch(logoutUser())
  }

  // Load dashboard data from backend
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load both overview and analytics data in parallel
      const [overviewResponse, analyticsResponse] = await Promise.all([
        apiClient.get('/dashboard/brand/overview'),
        apiClient.get('/dashboard/brand/analytics')
      ])
      
      setDashboardData(overviewResponse.data)
      setAnalyticsData(analyticsResponse.data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError('Failed to load dashboard data')
      
      // Use mock data as fallback
      const mockData: BrandDashboardBackendData = {
        totalCampaigns: 12,
        activeCampaigns: 3,
        totalContentSubmissions: 45,
        topInfluencers: [
          {
            id: '1',
            name: 'Murugi Munyi',
            handle: '@murugi',
            profilePicture: '/api/placeholder/40/40',
            totalSubmissions: 8
          },
          {
            id: '2',
            name: 'Sarah Johnson',
            handle: '@sarah',
            profilePicture: '/api/placeholder/40/40',
            totalSubmissions: 6
          }
        ]
      }
      
      const mockAnalytics: BrandAnalyticsData = {
        overview: {
          totalCampaigns: 12,
          activeCampaigns: 3,
          totalInfluencers: 25,
          totalContentSubmissions: 45,
          totalReach: 2500000,
          totalImpressions: 3200000,
          totalEngagement: 187500,
          avgEngagementRate: 7.5,
          totalSpent: 15000,
          totalPayments: 32
        },
        topCampaigns: [
          {
            id: '1',
            title: 'Summer Collection Launch',
            reach: 850000,
            engagement: 68000,
            engagementRate: 8.0,
            participantsCount: 12,
            contentCount: 18
          },
          {
            id: '2',
            title: 'Back to School Campaign',
            reach: 520000,
            engagement: 41600,
            engagementRate: 8.0,
            participantsCount: 8,
            contentCount: 12
          }
        ],
        roi: {
          totalSpent: 15000,
          totalReach: 2500000,
          totalEngagement: 187500,
          costPerReach: 0.006,
          costPerEngagement: 0.08,
          engagementRate: 7.5
        }
      }
      
      setDashboardData(mockData)
      setAnalyticsData(mockAnalytics)
    } finally {
      setLoading(false)
    }
  }

  // Utility functions for formatting
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString()}`
  }

  const formatPercentage = (rate: number): string => {
    return `${rate.toFixed(1)}%`
  }

  // Mock data for other components (will be replaced with backend data later)
  const activeCampaigns = [
    {
      id: 1,
      name: "Summer Skincare",
      status: "active",
      influencers: 12,
      budget: "$5,000",
      performance: "+15%"
    },
    {
      id: 2,
      name: "Product Launch",
      status: "pending",
      influencers: 8,
      budget: "$3,200",
      performance: "N/A"
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
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
            <h1 className="text-2xl font-semibold text-slate-900">Brand Dashboard</h1>
            <p className="text-slate-600">Welcome back, manage your campaigns</p>
          </div>
          
          {/* Add notifications to header */}
          <div className="flex items-center space-x-4">
            <NotificationSystem userRole="brand" />
            
            {/* User profile section */}
            <div className="flex items-center space-x-3">
              <img 
                src="/api/placeholder/40/40" 
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">Brand Manager</p>
                <p className="text-xs text-slate-600">brand@company.com</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-slate-200 min-h-screen">
          <nav className="p-4 space-y-2">
            <NavItem icon={BarChart3} label="Overview" active />
            <NavItem 
              icon={Target} 
              label="Campaigns"
              onClick={() => navigate('/campaigns')}
            />
            <NavItem 
              icon={Users} 
              label="Influencers" 
              onClick={() => navigate('/discover/influencers')}
            />
            <NavItem 
              icon={TrendingUp} 
              label="Analytics"
              onClick={() => navigate('/analytics')}
            />
            <NavItem 
              icon={CheckCircle} 
              label="Approvals"
              onClick={() => navigate('/content/approvals')}
            />
            <NavItem 
              icon={Settings} 
              label="Settings"
              onClick={() => navigate('/settings')}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Enhanced Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatsCard 
              title="Active Campaigns"
              value={analyticsData?.overview.activeCampaigns.toString() || dashboardData?.activeCampaigns.toString() || '0'}
              icon={Target}
              trend={`${analyticsData?.overview.totalCampaigns || 0} total`}
              color="bg-blue-500"
            />
            <StatsCard 
              title="Total Reach"
              value={analyticsData?.overview.totalReach ? formatNumber(analyticsData.overview.totalReach) : '0'}
              icon={Eye}
              trend={`${analyticsData?.overview.totalInfluencers || 0} influencers`}
              color="bg-green-500"
            />
            <StatsCard 
              title="Engagement"
              value={analyticsData?.overview.totalEngagement ? formatNumber(analyticsData.overview.totalEngagement) : '0'}
              icon={TrendingUp}
              trend={analyticsData?.overview.avgEngagementRate ? formatPercentage(analyticsData.overview.avgEngagementRate) : '0%'}
              color="bg-purple-500"
            />
            <StatsCard 
              title="Total Spent"
              value={analyticsData?.overview.totalSpent ? formatCurrency(analyticsData.overview.totalSpent) : '$0'}
              icon={DollarSign}
              trend={`${analyticsData?.overview.totalPayments || 0} payments`}
              color="bg-orange-500"
            />
          </div>

          {/* ROI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Cost per Reach</p>
                    <p className="text-xl font-bold text-slate-900">
                      {analyticsData?.roi.costPerReach ? `$${analyticsData.roi.costPerReach.toFixed(3)}` : '$0.000'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Zap className="w-5 h-5 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Cost per Engagement</p>
                    <p className="text-xl font-bold text-slate-900">
                      {analyticsData?.roi.costPerEngagement ? `$${analyticsData.roi.costPerEngagement.toFixed(2)}` : '$0.00'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-pink-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Engagement Rate</p>
                    <p className="text-xl font-bold text-slate-900">
                      {analyticsData?.roi.engagementRate ? formatPercentage(analyticsData.roi.engagementRate) : '0%'}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Campaigns */}
          {analyticsData?.topCampaigns && analyticsData.topCampaigns.length > 0 && (
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">Top Performing Campaigns</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/campaigns')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.topCampaigns.slice(0, 3).map((campaign, index) => (
                    <div 
                      key={campaign.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900 hover:text-primary">{campaign.title}</h3>
                          <p className="text-sm text-slate-600">
                            {campaign.participantsCount} influencers • {campaign.contentCount} content pieces
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="text-center">
                            <p className="text-slate-500">Reach</p>
                            <p className="font-semibold text-slate-900">{formatNumber(campaign.reach)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-500">Engagement</p>
                            <p className="font-semibold text-slate-900">{formatNumber(campaign.engagement)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-slate-500">Rate</p>
                            <p className="font-semibold text-green-600">{formatPercentage(campaign.engagementRate)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Active Campaigns */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Active Campaigns</CardTitle>
                  <Button variant="outline" size="sm">View All</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeCampaigns.map((campaign) => (
                    <div 
                      key={campaign.id} 
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => navigate(`/campaigns/${campaign.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          campaign.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <h3 className="font-medium text-slate-900 hover:text-primary">{campaign.name}</h3>
                          <p className="text-sm text-slate-600">
                            {campaign.influencers} influencers • {campaign.budget}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                        {campaign.performance !== 'N/A' && (
                          <p className="text-sm text-green-600 mt-1">{campaign.performance}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ActivityItem 
                    icon={CheckCircle}
                    text="Content approved for Summer Skincare campaign"
                    time="2 hours ago"
                    iconColor="text-green-500"
                  />
                  <ActivityItem 
                    icon={Users}
                    text="New influencer joined Product Launch campaign"
                    time="5 hours ago"
                    iconColor="text-blue-500"
                  />
                  <ActivityItem 
                    icon={Camera}
                    text="3 new content submissions pending review"
                    time="1 day ago"
                    iconColor="text-yellow-500"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              
              {/* Top Performing Influencers */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Top Influencers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(dashboardData?.topInfluencers || []).map((influencer) => (
                    <div 
                      key={influencer.id} 
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/influencer/${influencer.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img 
                            src={influencer.profilePicture || '/api/placeholder/40/40'} 
                            alt={influencer.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                            <Star className="w-2.5 h-2.5 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{influencer.name}</p>
                          <p className="text-xs text-slate-600">{influencer.handle}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{influencer.totalSubmissions}</p>
                        <p className="text-xs text-green-600">submissions</p>
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => navigate('/discover/influencers')}
                  >
                    View All Influencers
                  </Button>
                </CardContent>
              </Card>

              {/* Pending Actions */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Pending Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <PendingAction 
                    text="5 content submissions to review"
                    action="Review"
                    urgent
                  />
                  <PendingAction 
                    text="2 campaign applications"
                    action="View"
                  />
                  <PendingAction 
                    text="Budget approval needed"
                    action="Approve"
                  />
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/campaigns/create')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/discover/influencers')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Find Influencers
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/content/approvals')}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Review Content
                  </Button>
                </CardContent>
              </Card>
            </div>
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

function ActivityItem({ icon: Icon, text, time, iconColor }: {
  icon: any,
  text: string,
  time: string,
  iconColor: string
}) {
  return (
    <div className="flex items-center space-x-3">
      <Icon className={`w-5 h-5 ${iconColor}`} />
      <div className="flex-1">
        <p className="text-sm text-slate-900">{text}</p>
        <p className="text-xs text-slate-500">{time}</p>
      </div>
    </div>
  )
}

function PendingAction({ text, action, urgent = false }: {
  text: string,
  action: string,
  urgent?: boolean
}) {
  return (
    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
      <div className="flex items-center space-x-2">
        {urgent && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
        <p className="text-sm text-slate-900">{text}</p>
      </div>
      <Button variant="outline" size="sm">{action}</Button>
    </div>
  )
}
