import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Heart, 
  Users, 
  TrendingUp, 
  MapPin, 
  Star,
  Plus,
  ArrowLeft,
  
  List,
  ChevronDown,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Checkbox } from '../../components/ui/checkbox'
import NotificationSystem from '../../components/notifications/NotificationSystem'

interface Influencer {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  followers: string
  engagement: string
  location: string
  niches: string[]
  platforms: { platform: string; followers: string }[]
  avgViews: string
  isVerified: boolean
  isShortlisted: boolean
  rating: number
  priceRange: string
}

interface Filters {
  search: string
  minFollowers: string
  maxFollowers: string
  locations: string[]
  niches: string[]
  platforms: string[]
  engagementMin: string
  verified: boolean
}

export default function DiscoverInfluencers() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [filters, setFilters] = useState<Filters>({
    search: '',
    minFollowers: '',
    maxFollowers: '',
    locations: [],
    niches: [],
    platforms: [],
    engagementMin: '',
    verified: false
  })

  // Mock data - replace with API call
  const [influencers, setInfluencers] = useState<Influencer[]>([
    {
      id: '1',
      name: 'Murugi Munyi',
      username: '@murugimunyi',
      avatar: '/api/placeholder/100/100',
      bio: 'Lifestyle content creator sharing authentic moments from Nairobi. Beauty & wellness enthusiast.',
      followers: '532K',
      engagement: '8.4%',
      location: 'Nairobi, Kenya',
      niches: ['Lifestyle', 'Beauty', 'Fashion'],
      platforms: [
        { platform: 'Instagram', followers: '532K' },
        { platform: 'TikTok', followers: '245K' }
      ],
      avgViews: '45K',
      isVerified: true,
      isShortlisted: false,
      rating: 4.8,
      priceRange: '$200-500'
    },
    {
      id: '2',
      name: 'David Tech',
      username: '@davidtech_ke',
      avatar: '/api/placeholder/100/100',
      bio: 'Tech reviewer and gadget enthusiast. Helping East Africans make smart tech choices.',
      followers: '128K',
      engagement: '12.1%',
      location: 'Kampala, Uganda',
      niches: ['Technology', 'Reviews', 'Gaming'],
      platforms: [
        { platform: 'YouTube', followers: '128K' },
        { platform: 'Instagram', followers: '89K' }
      ],
      avgViews: '25K',
      isVerified: false,
      isShortlisted: true,
      rating: 4.6,
      priceRange: '$150-300'
    },
    {
      id: '3',
      name: 'Sarah Fitness',
      username: '@sarahfitness',
      avatar: '/api/placeholder/100/100',
      bio: 'Certified fitness trainer empowering women across Africa to live healthier lives.',
      followers: '245K',
      engagement: '15.2%',
      location: 'Lagos, Nigeria',
      niches: ['Fitness', 'Health', 'Wellness'],
      platforms: [
        { platform: 'Instagram', followers: '245K' },
        { platform: 'TikTok', followers: '156K' }
      ],
      avgViews: '38K',
      isVerified: true,
      isShortlisted: false,
      rating: 4.9,
      priceRange: '$300-600'
    }
  ])

  const niches = ['Fashion', 'Beauty', 'Technology', 'Fitness', 'Food', 'Travel', 'Lifestyle', 'Gaming', 'Health']
  const locations = ['Kenya', 'Uganda', 'Tanzania', 'Nigeria', 'South Africa', 'Ghana', 'Rwanda']
  const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X']

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleArrayFilterChange = (key: 'locations' | 'niches' | 'platforms', value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...prev[key], value]
        : prev[key].filter(item => item !== value)
    }))
  }

  const toggleShortlist = (influencerId: string) => {
    setInfluencers(prev => 
      prev.map(inf => 
        inf.id === influencerId 
          ? { ...inf, isShortlisted: !inf.isShortlisted }
          : inf
      )
    )
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      minFollowers: '',
      maxFollowers: '',
      locations: [],
      niches: [],
      platforms: [],
      engagementMin: '',
      verified: false
    })
  }

  const filteredInfluencers = influencers.filter(influencer => {
    if (filters.search && !influencer.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !influencer.username.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.niches.length > 0 && !filters.niches.some(niche => influencer.niches.includes(niche))) {
      return false
    }
    if (filters.verified && !influencer.isVerified) {
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/brand')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Discover Influencers</h1>
              <p className="text-slate-600">{filteredInfluencers.length} influencers found</p>
            </div>
          </div>
          
          {/* Add notifications and other controls */}
          <div className="flex items-center space-x-3">
            <NotificationSystem userRole="brand" />
            
            <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
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
                    placeholder="Search influencers..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Followers Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Followers Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.minFollowers}
                    onChange={(e) => handleFilterChange('minFollowers', e.target.value)}
                  />
                  <Input
                    placeholder="Max"
                    value={filters.maxFollowers}
                    onChange={(e) => handleFilterChange('maxFollowers', e.target.value)}
                  />
                </div>
              </div>

              {/* Engagement Rate */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Min Engagement Rate (%)</label>
                <Input
                  placeholder="e.g., 5"
                  value={filters.engagementMin}
                  onChange={(e) => handleFilterChange('engagementMin', e.target.value)}
                />
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

              {/* Locations */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Locations</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {locations.map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={location}
                        checked={filters.locations.includes(location)}
                        onCheckedChange={(checked) => handleArrayFilterChange('locations', location, !!checked)}
                      />
                      <label htmlFor={location} className="text-sm text-slate-700">{location}</label>
                    </div>
                  ))}
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

              {/* Verified Only */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={filters.verified}
                  onCheckedChange={(checked) => handleFilterChange('verified', !!checked)}
                />
                <label htmlFor="verified" className="text-sm text-slate-700">Verified accounts only</label>
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
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInfluencers.map((influencer) => (
                <InfluencerCard 
                  key={influencer.id} 
                  influencer={influencer} 
                  onToggleShortlist={toggleShortlist}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInfluencers.map((influencer) => (
                <InfluencerListItem 
                  key={influencer.id} 
                  influencer={influencer} 
                  onToggleShortlist={toggleShortlist}
                />
              ))}
            </div>
          )}

          {/* Load More */}
          {filteredInfluencers.length > 0 && (
            <div className="mt-8 text-center">
              <Button variant="outline" disabled={loading}>
                {loading ? 'Loading...' : 'Load More Influencers'}
              </Button>
            </div>
          )}

          {/* Empty State */}
          {filteredInfluencers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No influencers found</h3>
              <p className="text-slate-600 mb-4">Try adjusting your filters to see more results</p>
              <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function InfluencerCard({ influencer, onToggleShortlist }: { 
  influencer: Influencer, 
  onToggleShortlist: (id: string) => void 
}) {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img 
              src={influencer.avatar} 
              alt={influencer.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center space-x-1">
                <h3 className="font-semibold text-slate-900">{influencer.name}</h3>
                {influencer.isVerified && <Star className="w-4 h-4 text-yellow-500" />}
              </div>
              <p className="text-sm text-slate-600">{influencer.username}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleShortlist(influencer.id)}
            className={influencer.isShortlisted ? 'text-red-500' : 'text-slate-400'}
          >
            <Heart className={`w-4 h-4 ${influencer.isShortlisted ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <p className="text-sm text-slate-600 mb-4 line-clamp-2">{influencer.bio}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">{influencer.followers}</p>
            <p className="text-xs text-slate-600">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-slate-900">{influencer.engagement}</p>
            <p className="text-xs text-slate-600">Engagement</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 mb-4">
          <MapPin className="w-3 h-3 text-slate-400" />
          <p className="text-xs text-slate-600">{influencer.location}</p>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {influencer.niches.slice(0, 3).map((niche) => (
            <Badge key={niche} variant="secondary" className="text-xs">
              {niche}
            </Badge>
          ))}
        </div>

        <div className="flex space-x-2">
          <Button size="sm" className="flex-1">
            View Profile
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <Plus className="w-3 h-3 mr-1" />
            Invite
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function InfluencerListItem({ influencer, onToggleShortlist }: { 
  influencer: Influencer, 
  onToggleShortlist: (id: string) => void 
}) {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src={influencer.avatar} 
              alt={influencer.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-slate-900">{influencer.name}</h3>
                {influencer.isVerified && <Star className="w-4 h-4 text-yellow-500" />}
                <span className="text-sm text-slate-600">{influencer.username}</span>
              </div>
              <p className="text-sm text-slate-600 mb-2">{influencer.bio}</p>
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <span className="flex items-center space-x-1">
                  <Users className="w-3 h-3" />
                  <span>{influencer.followers}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{influencer.engagement}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{influencer.location}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex flex-wrap gap-1">
              {influencer.niches.slice(0, 2).map((niche) => (
                <Badge key={niche} variant="secondary" className="text-xs">
                  {niche}
                </Badge>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleShortlist(influencer.id)}
              className={influencer.isShortlisted ? 'text-red-500' : 'text-slate-400'}
            >
              <Heart className={`w-4 h-4 ${influencer.isShortlisted ? 'fill-current' : ''}`} />
            </Button>
            <Button size="sm" variant="outline">
              View Profile
            </Button>
            <Button size="sm">
              <Plus className="w-3 h-3 mr-1" />
              Invite
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
