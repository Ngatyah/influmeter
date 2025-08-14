import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit3,
  Play,
  Pause,
  Users,
  DollarSign,
  Calendar,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { campaignService, Campaign } from '../../services/campaign.service'
import { formatSafeDate } from '../../utils/dateUtils'

export default function MyCampaigns() {
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Load campaigns from backend
  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const filters = {
        search: searchTerm || undefined,
        status: selectedTab !== 'all' ? selectedTab.toUpperCase() as any : undefined,
      }

      const result = await campaignService.getMyCampaigns(filters)
      setCampaigns(result.campaigns)
    } catch (error) {
      console.error('Failed to load campaigns:', error)
      setError(error instanceof Error ? error.message : 'Failed to load campaigns')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // Refresh campaigns
  const refreshCampaigns = () => {
    loadCampaigns(true)
  }

  // Handle search and filter changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (!loading) {
        loadCampaigns()
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, selectedTab])

  // Mock campaigns data for fallback (to be removed after testing)
  const mockCampaigns: any[] = [
    {
      id: '1',
      title: 'Summer Skincare Collection Launch',
      status: 'active',
      budget: 5000,
      spent: 2800,
      startDate: '2024-04-15',
      endDate: '2024-05-15',
      influencersJoined: 12,
      targetInfluencers: 20,
      contentSubmitted: 8,
      contentApproved: 5,
      totalReach: 850000,
      engagement: 8.2,
      objective: 'Brand Awareness',
      createdAt: '2024-04-10'
    },
    {
      id: '2',
      title: 'Tech Product Review Series',
      status: 'completed',
      budget: 3200,
      spent: 3200,
      startDate: '2024-03-01',
      endDate: '2024-03-31',
      influencersJoined: 8,
      targetInfluencers: 10,
      contentSubmitted: 15,
      contentApproved: 15,
      totalReach: 420000,
      engagement: 6.8,
      objective: 'Product Launch',
      createdAt: '2024-02-25'
    },
    {
      id: '3',
      title: 'Holiday Season Promotion',
      status: 'paused',
      budget: 4500,
      spent: 1200,
      startDate: '2024-04-20',
      endDate: '2024-05-20',
      influencersJoined: 5,
      targetInfluencers: 15,
      contentSubmitted: 2,
      contentApproved: 1,
      totalReach: 125000,
      engagement: 4.5,
      objective: 'Sales',
      createdAt: '2024-04-18'
    },
    {
      id: '4',
      title: 'Eco-Friendly Product Line',
      status: 'draft',
      budget: 6000,
      spent: 0,
      startDate: '2024-05-01',
      endDate: '2024-06-01',
      influencersJoined: 0,
      targetInfluencers: 25,
      contentSubmitted: 0,
      contentApproved: 0,
      totalReach: 0,
      engagement: 0,
      objective: 'Brand Awareness',
      createdAt: '2024-04-22'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-900'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return <Play className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
      case 'draft': return <Edit3 className="w-4 h-4" />
      case 'cancelled': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesTab = selectedTab === 'all' || campaign.status.toUpperCase() === selectedTab.toUpperCase()
    const matchesSearch = !searchTerm || 
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (campaign.objective && campaign.objective.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesTab && matchesSearch
  })

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-600">Loading campaigns...</p>
          </div>
        </div>
      </div>
    )
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
              <h1 className="text-2xl font-semibold text-slate-900">My Campaigns</h1>
              <p className="text-slate-600">{campaigns.length} total campaigns</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button onClick={() => navigate('/campaigns/create')}>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
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
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={refreshCampaigns}
                  disabled={refreshing}
                  className="text-red-600 hover:text-red-700"
                >
                  {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </Button>
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
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Campaigns</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {campaigns.filter(c => c.status === 'ACTIVE').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Budget</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(campaigns.reduce((sum, c) => sum + (c.budget || 0), 0))}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Participants</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {campaigns.reduce((sum, c) => sum + (c._count?.participants || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Content</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {campaigns.reduce((sum, c) => sum + (c._count?.contentSubmissions || 0), 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">All ({campaigns.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({campaigns.filter(c => c.status === 'ACTIVE').length})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Draft ({campaigns.filter(c => c.status === 'DRAFT').length})
            </TabsTrigger>
            <TabsTrigger value="paused">
              Paused ({campaigns.filter(c => c.status === 'PAUSED').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({campaigns.filter(c => c.status === 'COMPLETED').length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({campaigns.filter(c => c.status === 'CANCELLED').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => (
            <Card 
              key={campaign.id} 
              className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => navigate(`/campaigns/${campaign.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 line-clamp-2">{campaign.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{campaign.objective}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={`${getStatusColor(campaign.status)} flex items-center space-x-1`}>
                      {getStatusIcon(campaign.status)}
                      <span className="capitalize">{campaign.status}</span>
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Campaign Status</span>
                    <span className="font-medium capitalize">
                      {campaign.status}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        campaign.status === 'ACTIVE' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                        campaign.status === 'COMPLETED' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                        campaign.status === 'DRAFT' ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                        'bg-gradient-to-r from-yellow-400 to-yellow-600'
                      }`}
                      style={{ 
                        width: campaign.status === 'ACTIVE' ? '100%' : 
                               campaign.status === 'COMPLETED' ? '100%' : 
                               campaign.status === 'DRAFT' ? '25%' : '50%' 
                      }}
                    />
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Applicants</p>
                    <p className="font-semibold">{campaign._count?.applications || 0}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Participants</p>
                    <p className="font-semibold">{campaign._count?.participants || 0}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Content Submitted</p>
                    <p className="font-semibold">{campaign._count?.contentSubmissions || 0}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Budget</p>
                    <p className="font-semibold text-green-600">{formatCurrency(campaign.budget)}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {campaign.startDate ? 
                          formatSafeDate(campaign.startDate) : 
                          'No start date'
                        }
                      </span>
                    </div>
                    <span>→</span>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {campaign.endDate ? 
                          formatSafeDate(campaign.endDate) : 
                          'No end date'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigate(`/campaigns/${campaign.id}`)
                    }}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  
                  {campaign.status === 'DRAFT' && (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Launch campaign action
                      }}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      Launch
                    </Button>
                  )}
                  
                  {campaign.status === 'ACTIVE' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Pause campaign action
                      }}
                    >
                      <Pause className="w-3 h-3 mr-1" />
                      Pause
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No campaigns found</h3>
            <p className="text-slate-600 mb-6">
              {searchTerm ? 'Try adjusting your search terms' : 'Create your first campaign to get started'}
            </p>
            <Button onClick={() => navigate('/campaigns/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
