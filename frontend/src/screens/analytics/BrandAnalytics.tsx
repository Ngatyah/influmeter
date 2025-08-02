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
  Filter,
  Download,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

export default function BrandAnalytics() {
  const navigate = useNavigate()
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')

  // Mock analytics data
  const overviewStats = {
    totalCampaigns: 12,
    activeCampaigns: 5,
    totalInfluencers: 45,
    totalReach: 2500000,
    totalImpressions: 4200000,
    totalEngagements: 350000,
    averageEngagementRate: 8.3,
    totalSpent: 15750,
    costPerEngagement: 0.045,
    roi: 320
  }

  const campaignPerformance = [
    {
      id: 1,
      name: 'Summer Skincare Launch',
      status: 'active',
      reach: 850000,
      impressions: 1200000,
      engagements: 98000,
      engagementRate: 8.2,
      spent: 5000,
      roi: 340
    },
    {
      id: 2,
      name: 'Tech Product Review',
      status: 'completed',
      reach: 420000,
      impressions: 680000,
      engagements: 45000,
      engagementRate: 6.6,
      spent: 3200,
      roi: 280
    },
    {
      id: 3,
      name: 'Fitness Challenge',
      status: 'active',
      reach: 320000,
      impressions: 450000,
      engagements: 38000,
      engagementRate: 8.4,
      spent: 2800,
      roi: 290
    }
  ]

  const topInfluencers = [
    {
      id: 1,
      name: 'Murugi Munyi',
      avatar: '/api/placeholder/60/60',
      followers: '532K',
      campaigns: 3,
      avgEngagement: 12.5,
      totalReach: 450000,
      performance: 'excellent'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      avatar: '/api/placeholder/60/60',
      followers: '245K',
      campaigns: 2,
      avgEngagement: 9.8,
      totalReach: 280000,
      performance: 'good'
    },
    {
      id: 3,
      name: 'David Kim',
      avatar: '/api/placeholder/60/60',
      followers: '128K',
      campaigns: 2,
      avgEngagement: 15.2,
      totalReach: 180000,
      performance: 'excellent'
    }
  ]

  const platformData = [
    { platform: 'Instagram', reach: 1200000, engagements: 150000, posts: 45 },
    { platform: 'TikTok', reach: 800000, engagements: 120000, posts: 28 },
    { platform: 'YouTube', reach: 500000, engagements: 80000, posts: 12 }
  ]

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'excellent': return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
      case 'good': return <Badge className="bg-blue-100 text-blue-800">Good</Badge>
      case 'average': return <Badge className="bg-yellow-100 text-yellow-800">Average</Badge>
      default: return <Badge variant="secondary">-</Badge>
    }
  }

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
              <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
              <p className="text-slate-600">Track your campaign performance and ROI</p>
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
                    +12.5%
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
                    +8.2%
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
                    {overviewStats.averageEngagementRate}%
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
                  <p className="text-sm text-slate-600">ROI</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {overviewStats.roi}%
                  </p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +15.3%
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
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
            <TabsTrigger value="influencers">Top Influencers</TabsTrigger>
            <TabsTrigger value="platforms">Platform Analysis</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignPerformance.map((campaign) => (
                    <div 
                      key={campaign.id}
                      className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="md:col-span-2">
                        <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Reach</p>
                        <p className="font-semibold">{formatNumber(campaign.reach)}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Impressions</p>
                        <p className="font-semibold">{formatNumber(campaign.impressions)}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Engagements</p>
                        <p className="font-semibold">{formatNumber(campaign.engagements)}</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-slate-600">Eng. Rate</p>
                        <p className="font-semibold text-green-600">{campaign.engagementRate}%</p>
                      </div>
                      
                      <div className="text-center">
                        <p className="text-sm text-slate-600">ROI</p>
                        <p className="font-semibold text-blue-600">{campaign.roi}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="influencers">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Top Performing Influencers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topInfluencers.map((influencer) => (
                    <div 
                      key={influencer.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <img 
                          src={influencer.avatar} 
                          alt={influencer.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-slate-900">{influencer.name}</h3>
                          <p className="text-sm text-slate-600">
                            {influencer.followers} followers • {influencer.campaigns} campaigns
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Avg. Engagement</p>
                          <p className="font-semibold text-green-600">{influencer.avgEngagement}%</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm text-slate-600">Total Reach</p>
                          <p className="font-semibold">{formatNumber(influencer.totalReach)}</p>
                        </div>
                        
                        <div>
                          {getPerformanceBadge(influencer.performance)}
                        </div>
                        
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platforms">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Platform Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {platformData.map((platform) => (
                      <div key={platform.platform} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{platform.platform}</span>
                          <span className="text-sm text-slate-600">{platform.posts} posts</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">Reach: </span>
                            <span className="font-semibold">{formatNumber(platform.reach)}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Engagements: </span>
                            <span className="font-semibold">{formatNumber(platform.engagements)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              platform.platform === 'Instagram' ? 'bg-pink-500' :
                              platform.platform === 'TikTok' ? 'bg-black' : 'bg-red-500'
                            }`}
                            style={{ width: `${(platform.reach / 1200000) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Platform Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    <div className="text-center">
                      <PieChart className="w-16 h-16 mx-auto mb-4" />
                      <p>Platform distribution chart would go here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">📈 Best Performing Content</h4>
                    <p className="text-sm text-blue-800">
                      Video content generates 40% higher engagement than static posts across all platforms.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">⏰ Optimal Posting Times</h4>
                    <p className="text-sm text-green-800">
                      Posts published between 6-8 PM receive 25% more engagement on average.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">🎯 Audience Demographics</h4>
                    <p className="text-sm text-yellow-800">
                      65% of your audience is aged 18-34, primarily female (72%), located in urban areas.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                    <div>
                      <h4 className="font-medium text-slate-900">Increase Video Content</h4>
                      <p className="text-sm text-slate-600">
                        Consider allocating more budget to video-based campaigns for better ROI.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div>
                      <h4 className="font-medium text-slate-900">Focus on Micro-Influencers</h4>
                      <p className="text-sm text-slate-600">
                        Influencers with 50K-200K followers show higher engagement rates.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                    <div>
                      <h4 className="font-medium text-slate-900">Expand to TikTok</h4>
                      <p className="text-sm text-slate-600">
                        TikTok campaigns show 30% lower cost per engagement.
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
