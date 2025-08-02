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
  Search,
  Upload
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logoutUser } from '../../store/slices/authSlice'
import { useNavigate } from 'react-router-dom'

export default function InfluencerDashboard() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector(state => state.auth)
  
  const handleLogout = () => {
    dispatch(logoutUser())
  }

  const campaignInvites = [
    {
      id: 1,
      brand: "NIVEA Kenya",
      logo: "/api/placeholder/40/40",
      type: "Invite",
      status: "pending"
    },
    {
      id: 2,
      brand: "Safaricom",
      logo: "/api/placeholder/40/40", 
      type: "Application",
      status: "applied"
    }
  ]

  const upcomingPosts = [
    {
      id: 1,
      date: "April 26, 2024",
      type: "In-store photo",
      brand: "NIVEA Kenya",
      logo: "/api/placeholder/32/32"
    }
  ]

  const activeCampaigns = [
    {
      id: 1,
      name: "Summer Skincare",
      brand: "NIVEA Kenya",
      status: "content_due",
      payout: "$350",
      dueDate: "2024-05-10",
      progress: "Accepted - Content Due"
    },
    {
      id: 2,
      name: "Tech Review Series", 
      brand: "TechHub Africa",
      status: "in_review",
      payout: "$200",
      dueDate: "2024-05-15",
      progress: "Under Review"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={user?.avatar || "/api/placeholder/80/80"} 
              alt={user?.name || "User"}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{user?.name}</h1>
              <p className="text-slate-600">Influencer Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <Settings className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-slate-200 min-h-screen">
          <nav className="p-4 space-y-2">
            <NavItem icon={BarChart3} label="Overview" active />
            <NavItem icon={Users} label="My Profile" />
            <NavItem icon={Camera} label="Campaigns" />
            <NavItem 
              icon={TrendingUp} 
              label="Analytics"
              onClick={() => navigate('/analytics/influencer')}
            />
            <NavItem 
              icon={DollarSign} 
              label="Earnings"
              onClick={() => navigate('/earnings')}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Campaign Invites */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Campaign Invites & Applications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {campaignInvites.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {campaign.brand.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-900">{campaign.brand}</h3>
                          <p className="text-sm text-slate-600">{campaign.type}</p>
                        </div>
                      </div>
                      <Button 
                        variant={campaign.type === "Invite" ? "default" : "outline"}
                        size="sm"
                      >
                        {campaign.type === "Invite" ? "Accept" : "View"}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Active Campaigns - MOVED HERE */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold">My Active Campaigns</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => navigate('/campaigns/browse')}>
                    Find More
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeCampaigns.map((campaign) => (
                    <div 
                      key={campaign.id} 
                      className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-all duration-200 hover:border-slate-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {/* Status Indicator */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            campaign.status === 'content_due' 
                              ? 'bg-orange-100 text-orange-600' 
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {campaign.status === 'content_due' ? (
                              <Camera className="w-5 h-5" />
                            ) : (
                              <Clock className="w-5 h-5" />
                            )}
                          </div>

                          {/* Campaign Info */}
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                              <Badge 
                                variant={campaign.status === 'content_due' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {campaign.progress}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-4 text-sm text-slate-600">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span>{campaign.brand}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Due {new Date(campaign.dueDate).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions & Payout */}
                        <div className="flex items-center space-x-4">
                          {/* Payout */}
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="font-bold text-green-600">{campaign.payout}</span>
                            </div>
                            <span className="text-xs text-slate-500">Payout</span>
                          </div>

                          {/* Action Button */}
                          {campaign.status === 'content_due' && (
                            <Button 
                              size="sm"
                              onClick={() => navigate(`/campaigns/${campaign.id}/submit`)}
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Submit Content
                            </Button>
                          )}
                          {campaign.status === 'in_review' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => navigate(`/campaigns/${campaign.id}/details`)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Upcoming Posts */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Upcoming Posts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {upcomingPosts.map((post) => (
                    <div key={post.id} className="flex items-center space-x-3 p-4 border border-slate-200 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">N</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-600">{post.date}</p>
                        <h3 className="font-medium text-slate-900">{post.type}</h3>
                        <p className="text-sm text-slate-600">{post.brand}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Metrics */}
            <div className="space-y-6">
              
              {/* Personal Metrics */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Personal Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <MetricCard 
                      label="Followers"
                      value="12.5K"
                      icon={Users}
                    />
                    <MetricCard 
                      label="Engagement"
                      value="1.2K"
                      icon={TrendingUp}
                    />
                    <MetricCard 
                      label="Views"
                      value="25.3K"
                      icon={Eye}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* AI Coach Suggestions */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">AI Coach Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      Post more reels on <span className="font-semibold">Thursday evenings</span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Authenticity Score */}
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Authenticity Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-slate-900 mb-2">94</div>
                    <p className="text-sm text-slate-600">Trust Rating</p>
                    <div className="mt-4 w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `94%` }}
                      ></div>
                    </div>
                  </div>
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
                    onClick={() => navigate('/campaigns/browse')}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Browse Campaigns
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => {
                      const contentDueCampaign = activeCampaigns.find(c => c.status === 'content_due')
                      if (contentDueCampaign) {
                        navigate(`/campaigns/${contentDueCampaign.id}/submit`)
                      } else {
                        navigate('/campaigns/browse')
                      }
                    }}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Submit Content
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => navigate('/earnings')}
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    View Earnings
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
