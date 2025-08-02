import React, { useState } from 'react'
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
  Star
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Checkbox } from '../../components/ui/checkbox'

interface Campaign {
  id: string
  title: string
  brand: {
    name: string
    logo: string
    verified: boolean
  }
  description: string
  payout: string
  deadline: string
  requirements: {
    minFollowers: string
    platforms: string[]
    contentType: string[]
    niches: string[]
  }
  location: string[]
  participantsCount: number
  maxParticipants: number
  status: 'open' | 'closing_soon' | 'full'
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedHours: string
  isBookmarked: boolean
  hasApplied: boolean
}

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

  // Mock data - replace with API call
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      title: 'Summer Skincare Collection Launch',
      brand: {
        name: 'NIVEA Kenya',
        logo: '/api/placeholder/60/60',
        verified: true
      },
      description: 'Promote our new summer skincare line targeting young adults. Create authentic content showcasing product benefits.',
      payout: '$250-500',
      deadline: '2024-05-15',
      requirements: {
        minFollowers: '10K+',
        platforms: ['Instagram', 'TikTok'],
        contentType: ['Reels', 'Stories'],
        niches: ['Beauty', 'Lifestyle']
      },
      location: ['Kenya', 'Tanzania'],
      participantsCount: 12,
      maxParticipants: 20,
      status: 'open',
      difficulty: 'easy',
      estimatedHours: '2-3 hours',
      isBookmarked: false,
      hasApplied: false
    },
    {
      id: '2',
      title: 'Tech Gadget Review Campaign',
      brand: {
        name: 'TechHub Africa',
        logo: '/api/placeholder/60/60',
        verified: false
      },
      description: 'Review our latest smartphone accessories. Detailed video reviews showcasing features and benefits.',
      payout: '$150-300',
      deadline: '2024-05-10',
      requirements: {
        minFollowers: '5K+',
        platforms: ['YouTube', 'Instagram'],
        contentType: ['YouTube Video', 'Reels'],
        niches: ['Technology', 'Reviews']
      },
      location: ['Uganda', 'Kenya'],
      participantsCount: 18,
      maxParticipants: 20,
      status: 'closing_soon',
      difficulty: 'medium',
      estimatedHours: '4-6 hours',
      isBookmarked: true,
      hasApplied: false
    },
    {
      id: '3',
      title: 'Fitness Challenge Content Series',
      brand: {
        name: 'FitLife Africa',
        logo: '/api/placeholder/60/60',
        verified: true
      },
      description: 'Create motivational fitness content for our 30-day challenge. Share workout tips and healthy lifestyle content.',
      payout: '$400-800',
      deadline: '2024-05-20',
      requirements: {
        minFollowers: '25K+',
        platforms: ['Instagram', 'TikTok', 'YouTube'],
        contentType: ['Reels', 'YouTube Video', 'Stories'],
        niches: ['Fitness', 'Health', 'Wellness']
      },
      location: ['Nigeria', 'South Africa'],
      participantsCount: 15,
      maxParticipants: 15,
      status: 'full',
      difficulty: 'hard',
      estimatedHours: '6-8 hours',
      isBookmarked: false,
      hasApplied: true
    }
  ])

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
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, isBookmarked: !campaign.isBookmarked }
          : campaign
      )
    )
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

  const filteredCampaigns = campaigns.filter(campaign => {
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
  campaign: Campaign, 
  onToggleBookmark: (id: string) => void,
  onViewDetails: () => void,
  onApply: () => void
}) {
  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'open': return 'bg-green-500'
      case 'closing_soon': return 'bg-yellow-500'
      case 'full': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getDifficultyColor = (difficulty: Campaign['difficulty']) => {
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
            <span className="text-sm text-slate-600">Due {new Date(campaign.deadline).toLocaleDateString()}</span>
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
