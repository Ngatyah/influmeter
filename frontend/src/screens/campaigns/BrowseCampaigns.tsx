import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  Users, 
  Clock,
  MapPin,
  Tag,
  ArrowLeft,
  Eye,
  Heart,
  CheckCircle,
  X,
  Star,
  Loader2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Checkbox } from '../../components/ui/checkbox'
import { campaignService, Campaign, CampaignFilters } from '../../services/campaign.service'
import { formatSafeDate } from '../../utils/dateUtils'


interface Filters {
  search: string
  minPayout: string
  maxPayout: string
  platforms: string[]
  niches: string[]
  locations: string[]
  contentTypes: string[]
}

export default function BrowseCampaigns() {
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    minPayout: '',
    maxPayout: '',
    platforms: [],
    niches: [],
    locations: [],
    contentTypes: []
  })
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [bookmarkedCampaigns, setBookmarkedCampaigns] = useState<Set<string>>(new Set())
  const [appliedCampaigns, setAppliedCampaigns] = useState<Set<string>>(new Set())

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

      const searchFilters = {
        search: filters.search || undefined,
        minBudget: filters.minPayout ? parseFloat(filters.minPayout) : undefined,
        maxBudget: filters.maxPayout ? parseFloat(filters.maxPayout) : undefined,
      }

      const result = await campaignService.browseCampaigns(searchFilters)
      
      // Map campaigns with application status
      const campaignsWithStatus = result.campaigns.map((campaign: any) => ({
        ...campaign,
        hasApplied: campaign.applications && campaign.applications.length > 0,
        applicationStatus: campaign.applications?.[0]?.status || null
      }))
      
      setCampaigns(campaignsWithStatus)
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

  // Handle search and filter changes with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (!loading) {
        loadCampaigns()
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [filters.search, filters.minPayout, filters.maxPayout])


  const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X']
  const niches = ['Beauty', 'Fashion', 'Technology', 'Fitness', 'Food', 'Travel', 'Lifestyle']
  const locations = ['Kenya', 'Uganda', 'Tanzania', 'Nigeria', 'South Africa', 'Ghana']
  const contentTypes = ['Reels', 'Stories', 'YouTube Video', 'Static Posts', 'Live Videos']

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleArrayFilterChange = (key: 'platforms' | 'niches' | 'locations' | 'contentTypes', value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...prev[key], value]
        : prev[key].filter(item => item !== value)
    }))
  }

  const toggleBookmark = (campaignId: string) => {
    setBookmarkedCampaigns(prev => {
      const newBookmarks = new Set(prev)
      if (newBookmarks.has(campaignId)) {
        newBookmarks.delete(campaignId)
      } else {
        newBookmarks.add(campaignId)
      }
      return newBookmarks
    })
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      minPayout: '',
      maxPayout: '',
      platforms: [],
      niches: [],
      locations: [],
      contentTypes: []
    })
  }

  // Transform backend campaigns to display format
  const transformedCampaigns = campaigns.map(campaign => ({
    ...campaign,
    brand: {
      name: campaign.brand?.brandProfile?.companyName || 
             `${campaign.brand?.profile?.firstName || ''} ${campaign.brand?.profile?.lastName || ''}`.trim() || 'Unknown Brand',
      logo: campaign.brand?.brandProfile?.logoUrl || '/api/placeholder/60/60',
      verified: true // TODO: Add verification field to backend
    },
    payout: campaign.budget ? `$${campaign.budget}` : 'TBD',
    deadline: campaign.endDate || '',
    requirements: {
      minFollowers: '5K+', // TODO: Extract from targetCriteria
      platforms: ['Instagram', 'TikTok'], // TODO: Extract from requirements
      contentType: ['Posts', 'Stories'], // TODO: Extract from requirements
      niches: ['General'] // TODO: Extract from requirements
    },
    location: ['Global'], // TODO: Extract from targetCriteria
    participantsCount: campaign._count?.participants || 0,
    maxParticipants: 50, // TODO: Add to backend
    status: campaign.status === 'ACTIVE' ? 'open' : campaign.status === 'COMPLETED' ? 'full' : 'open',
    difficulty: 'medium' as const, // TODO: Calculate from requirements
    estimatedHours: '3-5 hours', // TODO: Extract from requirements
    isBookmarked: bookmarkedCampaigns.has(campaign.id),
    // Use the backend application status instead of local state
    hasApplied: campaign.hasApplied || false,
    applicationStatus: campaign.applicationStatus || null
  }))

  const filteredCampaigns = transformedCampaigns.filter(campaign => {
    if (filters.search && !campaign.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !campaign.brand.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.platforms.length > 0 && !filters.platforms.some(platform => campaign.requirements.platforms.includes(platform))) {
      return false
    }
    if (filters.niches.length > 0 && !filters.niches.some(niche => campaign.requirements.niches.includes(niche))) {
      return false
    }
    return true
  })

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
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/influencer')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Browse Campaigns</h1>
              <p className="text-slate-600">{filteredCampaigns.length} campaigns available</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Filters
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
                <AlertTriangle className="w-5 h-5 text-red-600" />
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

      <div className="flex relative">
        {/* Filters Sidebar */}
        <aside className={`bg-white/80 backdrop-blur-sm border-r border-slate-200 transition-all duration-300 z-20 ${
          showFilters 
            ? 'w-80 min-w-80' 
            : 'w-0 min-w-0 overflow-hidden'
        }`}>
          <div className="p-6 w-80">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search campaigns..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Payout Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Payout Range ($)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.minPayout}
                    onChange={(e) => handleFilterChange('minPayout', e.target.value)}
                  />
                  <Input
                    placeholder="Max"
                    value={filters.maxPayout}
                    onChange={(e) => handleFilterChange('maxPayout', e.target.value)}
                  />
                </div>
              </div>

              {/* Platforms */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Platforms</label>
                <div className="space-y-2">
                  {platforms.map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform}
                        checked={filters.platforms.includes(platform)}
                        onCheckedChange={(checked) => handleArrayFilterChange('platforms', platform, !!checked)}
                      />
                      <label htmlFor={platform} className="text-sm text-slate-700">{platform}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Niches */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Niches</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {niches.map((niche) => (
                    <div key={niche} className="flex items-center space-x-2">
                      <Checkbox
                        id={niche}
                        checked={filters.niches.includes(niche)}
                        onCheckedChange={(checked) => handleArrayFilterChange('niches', niche, !!checked)}
                      />
                      <label htmlFor={niche} className="text-sm text-slate-700">{niche}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Types */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Content Types</label>
                <div className="space-y-2">
                  {contentTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={filters.contentTypes.includes(type)}
                        onCheckedChange={(checked) => handleArrayFilterChange('contentTypes', type, !!checked)}
                      />
                      <label htmlFor={type} className="text-sm text-slate-700">{type}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {showFilters && (
          <div 
            className="fixed inset-0 bg-black/20 z-10 lg:hidden"
            onClick={() => setShowFilters(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 min-w-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => (
              <CampaignCard 
                key={campaign.id} 
                campaign={campaign} 
                onToggleBookmark={toggleBookmark}
                onViewDetails={() => navigate(`/campaigns/${campaign.id}/details`)}
                onApply={() => navigate(`/campaigns/${campaign.id}/apply`)}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No campaigns found</h3>
              <p className="text-slate-600 mb-4">Try adjusting your filters to see more campaigns</p>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function CampaignCard({ campaign, onToggleBookmark, onViewDetails, onApply }: { 
  campaign: any, 
  onToggleBookmark: (id: string) => void,
  onViewDetails: () => void,
  onApply: () => void
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500'
      case 'closing_soon': return 'bg-yellow-500'
      case 'full': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'hard': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img 
              src={campaign.brand.logo} 
              alt={campaign.brand.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center space-x-1">
                <h3 className="font-medium text-slate-900">{campaign.brand.name}</h3>
                {campaign.brand.verified && <Star className="w-4 h-4 text-yellow-500" />}
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(campaign.status)}`}></div>
                <span className="text-xs text-slate-600 capitalize">{campaign.status.replace('_', ' ')}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleBookmark(campaign.id)}
            className={campaign.isBookmarked ? 'text-red-500' : 'text-slate-400'}
          >
            <Heart className={`w-4 h-4 ${campaign.isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Title & Description */}
        <h2 className="text-lg font-semibold text-slate-900 mb-2">{campaign.title}</h2>
        <p className="text-sm text-slate-600 mb-4 line-clamp-3">{campaign.description}</p>

        {/* Key Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-slate-900">{campaign.payout}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-slate-600">{campaign.estimatedHours}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-slate-600">Due {formatSafeDate(campaign.deadline)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-slate-600">{campaign.participantsCount}/{campaign.maxParticipants}</span>
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500">Min followers:</span>
            <Badge variant="outline" className="text-xs">{campaign.requirements.minFollowers}</Badge>
          </div>
          <div className="flex flex-wrap gap-1">
            {campaign.requirements.platforms.map((platform) => (
              <Badge key={platform} variant="secondary" className="text-xs">
                {platform}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-1">
            {campaign.requirements.niches.map((niche) => (
              <Badge key={niche} variant="outline" className="text-xs">
                {niche}
              </Badge>
            ))}
          </div>
        </div>

        {/* Difficulty Badge */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={`text-xs ${getDifficultyColor(campaign.difficulty)}`}>
            {campaign.difficulty.charAt(0).toUpperCase() + campaign.difficulty.slice(1)}
          </Badge>
          {campaign.hasApplied && (
            <Badge className="text-xs bg-blue-50 text-blue-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Applied
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={onViewDetails} className="flex-1">
            <Eye className="w-3 h-3 mr-1" />
            View Details
          </Button>
          <Button 
            size="sm" 
            onClick={onApply}
            disabled={campaign.status === 'full' || campaign.hasApplied}
            className="flex-1"
          >
            {campaign.hasApplied ? 'Applied' : campaign.status === 'full' ? 'Full' : 'Apply Now'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
