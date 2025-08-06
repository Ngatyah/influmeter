import React from 'react'
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

export default function BrandDashboard() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  
  const handleLogout = () => {
    dispatch(logoutUser())
  }

  const brand = {
    name: "NIVEA Kenya",
    logo: "/api/placeholder/80/80",
    activeCampaigns: 3,
    totalInfluencers: 28,
    totalReach: "2.1M",
    engagement: "12.3%"
  }

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

  const topInfluencers = [
    {
      id: 1,
      name: "Murugi Munyi",
      followers: "532K",
      engagement: "8.4%",
      campaigns: 3
    },
    {
      id: 2,
      name: "Sarah Johnson",
      followers: "245K", 
      engagement: "12.1%",
      campaigns: 2
    }
  ]

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
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <StatsCard 
              title="Active Campaigns"
              value={brand.activeCampaigns.toString()}
              icon={Target}
              trend="+2 this month"
            />
            <StatsCard 
              title="Total Influencers"
              value={brand.totalInfluencers.toString()}
              icon={Users}
              trend="+8 this month"
            />
            <StatsCard 
              title="Total Reach"
              value={brand.totalReach}
              icon={Eye}
              trend="+25% vs last month"
            />
            <StatsCard 
              title="Avg Engagement"
              value={brand.engagement}
              icon={TrendingUp}
              trend="+2.1% vs last month"
            />
          </div>

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
                  {[
                    { 
                      id: '1',
                      name: 'Murugi Munyi', 
                      username: '@murugimunyi',
                      followers: '532K', 
                      engagement: '8.4%',
                      avatar: '/api/placeholder/40/40',
                      verified: true
                    },
                    { 
                      id: '2',
                      name: 'Sarah Johnson', 
                      username: '@sarahjohnson',
                      followers: '245K', 
                      engagement: '12.1%',
                      avatar: '/api/placeholder/40/40',
                      verified: true
                    },
                    { 
                      id: '3',
                      name: 'David Kim', 
                      username: '@davidkim',
                      followers: '128K', 
                      engagement: '15.2%',
                      avatar: '/api/placeholder/40/40',
                      verified: false
                    }
                  ].map((influencer) => (
                    <div 
                      key={influencer.id} 
                      className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/influencer/${influencer.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img 
                            src={influencer.avatar} 
                            alt={influencer.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {influencer.verified && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border border-white">
                              <Star className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{influencer.name}</p>
                          <p className="text-xs text-slate-600">{influencer.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{influencer.followers}</p>
                        <p className="text-xs text-green-600">{influencer.engagement} eng.</p>
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

function StatsCard({ title, value, icon: Icon, trend }: {
  title: string,
  value: string,
  icon: any,
  trend: string
}) {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-green-600 mt-1">{trend}</p>
          </div>
          <Icon className="w-8 h-8 text-slate-400" />
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
