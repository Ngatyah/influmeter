import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  TrendingUp, 
  Users, 
  Eye,
  Heart,
  MessageSquare,
  DollarSign,
  Target,
  Calendar,
  Instagram,
  Youtube,
  Share2,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

export default function InfluencerAnalytics() {
  const navigate = useNavigate()
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')

  // Mock analytics data
  const overviewStats = {
    totalReach: 850000,
    totalImpressions: 1200000,
    totalEngagements: 98000,
    avgEngagementRate: 8.2,
    followersGrowth: 12.5,
    totalEarnings: 2850,
    activeCampaigns: 3,
    completedCampaigns: 8
  }

  const platformStats = [
    {
      platform: 'Instagram',
      icon: Instagram,
      followers: 45000,
      posts: 24,
      reach: 320000,
      engagements: 42000,
      engagementRate: 13.1,
      growth: 8.5
    },
    {
      platform: 'TikTok',
      icon: Share2,
      followers: 28000,
      posts: 18,
      reach: 280000,
      engagements: 35000,
      engagementRate: 12.5,
      growth: 15.2
    },
    {
      platform: 'YouTube',
      icon: Youtube,
      followers: 12000,
      posts: 6,
      reach: 150000,
      engagements: 18000,
      engagementRate: 12.0,
      growth: 5.8
    }
  ]

  const campaignPerformance = [
    {
      id: 1,
      name: 'Summer Skincare Launch',
      brand: 'NIVEA Kenya',
      platform: 'Instagram',
      reach: 85000,
      engagements: 12000,
      engagementRate: 14.1,
      earnings: 350,
      status: 'completed',
      completedDate: '2024-04-20'
    },
    {
      id: 2,
      name: 'Tech Review Series',
      brand: 'TechHub Africa',
      platform: 'YouTube',
      reach: 45000,
      engagements: 5400,
      engagementRate: 12.0,
      earnings: 250,
      status: 'active',
      completedDate: null
    },
    {
      id: 3,
      name: 'Fitness Challenge',
      brand: 'FitLife Africa',
      platform: 'TikTok',
      reach: 65000,
      engagements: 9800,
      engagementRate: 15.1,
      earnings: 200,
      status: 'completed',
      completedDate: '2024-04-15'
    }
  ]

  const contentPerformance = [
    {
      id: 1,
      type: 'Reel',
      platform: 'Instagram',
      title: 'Morning skincare routine ✨',
      reach: 45000,
      likes: 3200,
      comments: 180,
      shares: 95,
      engagementRate: 7.7,
      date: '2024-04-20'
    },
    {
      id: 2,
      type: 'Video',
      platform: 'TikTok',
      title: 'Get ready with me! 💄',
      reach: 78000,
      likes: 8500,
      comments: 420,
      shares: 310,
      engagementRate: 12.0,
      date: '2024-04-18'
    },
    {
      id: 3,
      type: 'Story',
      platform: 'Instagram',
      title: 'Behind the scenes',
      reach: 28000,
      likes: 1200,
      comments: 45,
      shares: 0,
      engagementRate: 4.4,
      date: '2024-04-16'
    }
  ]

  const audienceInsights = {
    demographics: {
      ageGroups: [
        { range: '18-24', percentage: 35 },
        { range: '25-34', percentage: 45 },
        { range: '35-44', percentage: 15 },
        { range: '45+', percentage: 5 }
      ],
      gender: [
        { type: 'Female', percentage: 68 },
        { type: 'Male', percentage: 30 },
        { type: 'Other', percentage: 2 }
      ],
      topLocations: [
        { location: 'Nairobi, Kenya', percentage: 25 },
        { location: 'Lagos, Nigeria', percentage: 18 },
        { location: 'Kampala, Uganda', percentage: 12 },
        { location: 'Dar es Salaam, Tanzania', percentage: 10 }
      ]
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`
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
              <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
              <p className="text-slate-600">Track your performance and growth</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select 
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Reach</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatNumber(overviewStats.totalReach)}
                  </p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{overviewStats.followersGrowth}%
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Engagements</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatNumber(overviewStats.totalEngagements)}
                  </p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.2%
                  </div>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Avg. Engagement Rate</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {overviewStats.avgEngagementRate}%
                  </p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +2.1%
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(overviewStats.totalEarnings)}
                  </p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +28.5%
                  </div>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="platforms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="platforms">Platform Stats</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
            <TabsTrigger value="content">Content Analysis</TabsTrigger>
            <TabsTrigger value="audience">Audience Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="platforms">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {platformStats.map((platform) => (
                <Card key={platform.platform} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <platform.icon className="w-5 h-5" />
                        <CardTitle className="text-lg">{platform.platform}</CardTitle>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        +{platform.growth}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-600">Followers</p>
                        <p className="text-lg font-bold">{formatNumber(platform.followers)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Posts</p>
                        <p className="text-lg font-bold">{platform.posts}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Reach</p>
                        <p className="text-lg font-bold">{formatNumber(platform.reach)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Engagement</p>
                        <p className="text-lg font-bold text-green-600">{platform.engagementRate}%</p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Engagement Rate</span>
                        <span>{platform.engagementRate}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${(platform.engagementRate / 15) * 100}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Campaign Performance History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignPerformance.map((campaign) => (
                    <div 
                      key={campaign.id}
                      className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="md:col-span-2">
                        <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                        <p className="text-sm text-slate-600">{campaign.brand}</p>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Platform</p>
                        <p className="font-semibold">{campaign.platform}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Reach</p>
                        <p className="font-semibold">{formatNumber(campaign.reach)}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Eng. Rate</p>
                        <p className="font-semibold text-green-600">{campaign.engagementRate}%</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Earnings</p>
                        <p className="font-semibold text-blue-600">{formatCurrency(campaign.earnings)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentPerformance.map((content) => (
                    <div 
                      key={content.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {content.type.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{content.title}</h3>
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <span>{content.platform}</span>
                            <span>•</span>
                            <span>{content.type}</span>
                            <span>•</span>
                            <span>{new Date(content.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Reach</p>
                          <p className="font-semibold">{formatNumber(content.reach)}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Likes</p>
                          <p className="font-semibold text-pink-600">{formatNumber(content.likes)}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Eng. Rate</p>
                          <p className="font-semibold text-green-600">{content.engagementRate}%</p>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Age Demographics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {audienceInsights.demographics.ageGroups.map((group) => (
                    <div key={group.range} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{group.range}</span>
                        <span className="text-sm text-slate-600">{group.percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ width: `${group.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Top Locations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {audienceInsights.demographics.topLocations.map((location, index) => (
                    <div key={location.location} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-slate-600">{index + 1}</span>
                        </div>
                        <span className="font-medium">{location.location}</span>
                      </div>
                      <span className="text-sm text-slate-600">{location.percentage}%</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">📱 Best Platform</h4>
                      <p className="text-sm text-blue-800">
                        TikTok generates your highest engagement rate at 12.5%
                      </p>
                    </div>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2">⏰ Peak Time</h4>
                      <p className="text-sm text-green-800">
                        Your audience is most active between 7-9 PM weekdays
                      </p>
                    </div>
                    
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h4 className="font-semibold text-purple-900 mb-2">🎯 Top Content</h4>
                      <p className="text-sm text-purple-800">
                        Video content performs 40% better than static posts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
