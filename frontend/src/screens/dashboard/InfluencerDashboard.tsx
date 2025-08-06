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
  Target // Add this import
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logoutUser } from '../../store/slices/authSlice'
import NotificationSystem from '../../components/notifications/NotificationSystem'
import { dashboardService, InfluencerDashboardData } from '../../services/dashboard.service'

export default function InfluencerDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState<InfluencerDashboardData | null>(null)

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Connect to real backend API
      const data = await dashboardService.getInfluencerDashboard()
      setDashboardData(data)
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
      
      console.log('Using fallback mock data due to API error')
      setDashboardData(mockData)
    } finally {
      setLoading(false)
    }
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
                src="/api/placeholder/40/40" 
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">Influencer Name</p>
                <p className="text-xs text-slate-600">@username</p>
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
            <NavItem icon={Target} label="My Campaigns" onClick={() => navigate('/campaigns')} />
            <NavItem icon={Search} label="Browse Campaigns" onClick={() => navigate('/campaigns/browse')} />
            <NavItem icon={Camera} label="Content Library" onClick={() => navigate('/content')} />
            <NavItem icon={DollarSign} label="Earnings" onClick={() => navigate('/earnings')} />
            <NavItem icon={TrendingUp} label="Analytics" onClick={() => navigate('/analytics')} />
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
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <OverviewCard
              title="Total Earnings"
              value={`$${dashboardData?.earnings?.total?.toLocaleString() || '0'}`}
              subtitle={`+${dashboardData?.earnings?.growth || 0}% this month`}
              icon={<DollarSign className="w-6 h-6" />}
              trend="↗"
            />
            <OverviewCard
              title="Active Campaigns"
              value={dashboardData?.campaigns?.active || 0}
              subtitle={`${dashboardData?.campaigns?.completed || 0} completed`}
              icon={<Target className="w-6 h-6" />}
            />
            <OverviewCard
              title="Total Reach"
              value={dashboardData?.performance?.reach || '0'}
              subtitle={`${dashboardData?.performance?.avgViews || '0'} avg views`}
              icon={<Eye className="w-6 h-6" />}
            />
            <OverviewCard
              title="Engagement Rate"
              value={dashboardData?.performance?.engagement || '0%'}
              subtitle={`${dashboardData?.socialStats?.growth || 0}% growth`}
              icon={<TrendingUp className="w-6 h-6" />}
              trend="↗"
            />
          </div>

          {/* Active Campaigns & Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Active Campaigns */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.activeCampaigns?.map((campaign) => (
                    <div key={campaign.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{campaign.title}</h4>
                        <Badge variant="secondary">{campaign.status}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{campaign.brand}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Due: {campaign.deadline}</span>
                        <span className="font-semibold text-green-600">${campaign.earning}</span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${campaign.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{campaign.progress}% complete</p>
                      </div>
                    </div>
                  ))}
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
                  {dashboardData?.recentActivities?.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900">{activity.title}</h4>
                        <p className="text-sm text-slate-600">{activity.description}</p>
                        <p className="text-xs text-slate-500">{activity.timestamp}</p>
                      </div>
                      {activity.amount && (
                        <span className="font-semibold text-green-600">+${activity.amount}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Earnings & Performance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Earned</span>
                    <span className="font-semibold">${dashboardData?.earnings?.total?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">This Month</span>
                    <span className="font-semibold text-green-600">
                      ${dashboardData?.earnings?.thisMonth?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pending</span>
                    <span className="font-semibold text-yellow-600">
                      ${dashboardData?.earnings?.pending?.toLocaleString() || '0'}
                    </span>
                  </div>
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
