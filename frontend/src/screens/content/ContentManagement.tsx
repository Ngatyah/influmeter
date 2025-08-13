import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Upload, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ExternalLink,
  Calendar,
  DollarSign,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Loader2,
  RefreshCw,
  Link as LinkIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { contentService, ContentSubmission } from '../../services/content.service'
import { formatSafeDate, formatSafeDatetime } from '../../utils/dateUtils'

interface ContentManagementData {
  contentSubmissions: ContentSubmission[]
  total: number
  totalPages: number
  hasMore: boolean
}

export default function ContentManagement() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contentData, setContentData] = useState<ContentManagementData>({
    contentSubmissions: [],
    total: 0,
    totalPages: 0,
    hasMore: false
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, we'll use mock data until the backend endpoint is ready
      const mockData = await getMockContentSubmissions()
      setContentData(mockData)
    } catch (error) {
      console.error('Failed to load content:', error)
      setError(error instanceof Error ? error.message : 'Failed to load content')
    } finally {
      setLoading(false)
    }
  }

  const refreshContent = async () => {
    try {
      setRefreshing(true)
      const mockData = await getMockContentSubmissions()
      setContentData(mockData)
    } catch (error) {
      console.error('Failed to refresh content:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Mock data for development
  const getMockContentSubmissions = async (): Promise<ContentManagementData> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const mockSubmissions: ContentSubmission[] = [
      {
        id: '1',
        campaignId: 'camp1',
        influencerId: 'inf1',
        title: 'Summer Fashion Showcase',
        description: 'Showcasing the latest summer collection with vibrant colors and trendy styles.',
        caption: 'Loving these new summer vibes! ☀️ Perfect for beach days and city adventures. What\'s your favorite look? #SummerFashion #StyleInspo #BeachVibes',
        hashtags: ['#SummerFashion', '#StyleInspo', '#BeachVibes', '#OutfitGoals'],
        platforms: ['Instagram', 'TikTok'],
        contentType: 'IMAGE' as const,
        status: 'APPROVED' as const,
        amount: 500,
        submittedAt: '2024-01-15T10:00:00Z',
        approvedAt: '2024-01-16T14:30:00Z',
        campaign: {
          id: 'camp1',
          title: 'Summer Collection 2024',
          brand: {
            brandProfile: {
              companyName: 'Fashion Forward Co.'
            }
          }
        },
        files: [
          {
            id: 'file1',
            fileUrl: '/api/placeholder/400/400',
            fileType: 'image/jpeg',
            fileSize: 245760,
            thumbnailUrl: '/api/placeholder/200/200',
            createdAt: '2024-01-15T10:00:00Z'
          }
        ],
        publishedPosts: []
      },
      {
        id: '2',
        campaignId: 'camp2',
        influencerId: 'inf1',
        title: 'Fitness Transformation Journey',
        description: 'Documenting my 30-day fitness challenge with this amazing protein supplement.',
        caption: 'Day 15 of my transformation! Feeling stronger every day 💪 This protein powder has been a game-changer. Link in bio! #FitnessJourney #HealthyLiving #Transformation',
        hashtags: ['#FitnessJourney', '#HealthyLiving', '#Transformation', '#ProteinPower'],
        platforms: ['Instagram', 'YouTube'],
        contentType: 'VIDEO' as const,
        status: 'COMPLETED' as const,
        amount: 750,
        submittedAt: '2024-01-12T09:00:00Z',
        approvedAt: '2024-01-12T15:30:00Z',
        completedAt: '2024-01-18T12:00:00Z',
        campaign: {
          id: 'camp2',
          title: 'Fitness Revolution Campaign',
          brand: {
            brandProfile: {
              companyName: 'Healthy Life Supplements'
            }
          }
        },
        files: [
          {
            id: 'file2',
            fileUrl: '/api/placeholder/600/400',
            fileType: 'video/mp4',
            fileSize: 15728640,
            thumbnailUrl: '/api/placeholder/300/200',
            createdAt: '2024-01-12T09:00:00Z'
          }
        ],
        publishedPosts: [
          {
            id: 'post1',
            contentId: '2',
            platform: 'Instagram',
            postUrl: 'https://instagram.com/p/ABC123',
            postType: 'REEL',
            publishedAt: '2024-01-18T12:00:00Z',
            status: 'VERIFIED' as const,
            createdAt: '2024-01-18T12:05:00Z',
            updatedAt: '2024-01-18T12:05:00Z',
            performance: {
              publishedPostId: 'post1',
              views: 15420,
              likes: 892,
              comments: 47,
              shares: 23,
              saves: 156,
              clicks: 89,
              impressions: 18650,
              reach: 14230,
              engagementRate: 5.8,
              ctr: 0.48,
              lastUpdated: '2024-01-20T10:00:00Z'
            }
          }
        ]
      },
      {
        id: '3',
        campaignId: 'camp3',
        influencerId: 'inf1',
        title: 'Tech Review: Smart Watch',
        description: 'Comprehensive review of the latest smartwatch features for fitness enthusiasts.',
        caption: 'After 2 weeks with this smartwatch, here are my honest thoughts... 📱⌚ The health tracking is incredible! #TechReview #SmartWatch #FitnessTracker',
        hashtags: ['#TechReview', '#SmartWatch', '#FitnessTracker', '#TechLife'],
        platforms: ['YouTube', 'Instagram'],
        contentType: 'VIDEO' as const,
        status: 'PENDING' as const,
        amount: 1200,
        submittedAt: '2024-01-20T11:00:00Z',
        campaign: {
          id: 'camp3',
          title: 'Smart Tech Innovation',
          brand: {
            brandProfile: {
              companyName: 'TechGear Pro'
            }
          }
        },
        files: [
          {
            id: 'file3',
            fileUrl: '/api/placeholder/800/450',
            fileType: 'video/mp4',
            fileSize: 45097984,
            thumbnailUrl: '/api/placeholder/400/225',
            createdAt: '2024-01-20T11:00:00Z'
          }
        ],
        publishedPosts: []
      }
    ]

    return {
      contentSubmissions: mockSubmissions,
      total: mockSubmissions.length,
      totalPages: 1,
      hasMore: false
    }
  }

  const filteredContent = contentData.contentSubmissions.filter(submission => {
    const matchesSearch = searchQuery === '' || 
      submission.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.campaign?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.campaign?.brand?.brandProfile?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesTab = selectedTab === 'all' || 
      (selectedTab === 'pending-urls' && submission.status === 'APPROVED' && (!submission.publishedPosts || submission.publishedPosts.length === 0)) ||
      (selectedTab === 'published' && submission.publishedPosts && submission.publishedPosts.length > 0) ||
      (selectedTab === 'pending' && submission.status === 'PENDING')

    return matchesSearch && matchesTab
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'REJECTED': return <XCircle className="w-4 h-4" />
      case 'COMPLETED': return <CheckCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const needsUrlSubmission = (submission: ContentSubmission): boolean => {
    return submission.status === 'APPROVED' && (!submission.publishedPosts || submission.publishedPosts.length === 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-600">Loading your content...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/influencer')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Content Management</h1>
              <p className="text-slate-600">Manage your submissions and submit live post URLs</p>
            </div>
          </div>
          <Button 
            onClick={refreshContent}
            variant="outline"
            disabled={refreshing}
          >
            {refreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search campaigns, brands, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="pending-urls" className="relative">
              Needs URLs
              {contentData.contentSubmissions.filter(needsUrlSubmission).length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {contentData.contentSubmissions.filter(needsUrlSubmission).length}
                </div>
              )}
            </TabsTrigger>
            <TabsTrigger value="published">Published</TabsTrigger>
            <TabsTrigger value="pending">Pending Review</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab}>
            {error && (
              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {filteredContent.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {selectedTab === 'pending-urls' ? 'No content needs URL submission' : 
                   selectedTab === 'published' ? 'No published content yet' :
                   selectedTab === 'pending' ? 'No pending content' :
                   'No content submissions yet'}
                </h3>
                <p className="text-slate-600 mb-6">
                  {selectedTab === 'pending-urls' ? 'All your approved content has live URLs submitted.' : 
                   'Start by applying to campaigns and submitting content.'}
                </p>
                <Button onClick={() => navigate('/campaigns/browse')}>
                  <Search className="w-4 h-4 mr-2" />
                  Browse Campaigns
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredContent.map((submission) => (
                  <Card key={submission.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-1">{submission.title}</CardTitle>
                          <p className="text-sm text-slate-600">{submission.campaign?.brand?.brandProfile?.companyName}</p>
                          <p className="text-xs text-slate-500 mt-1">{submission.campaign?.title}</p>
                        </div>
                        <Badge className={getStatusColor(submission.status)}>
                          {getStatusIcon(submission.status)}
                          <span className="ml-1 capitalize">{submission.status.toLowerCase()}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Content Preview */}
                      {submission.files && submission.files.length > 0 && (
                        <div className="aspect-video rounded-lg overflow-hidden bg-slate-100">
                          {submission.files[0].fileType.startsWith('image/') ? (
                            <img 
                              src={submission.files[0].thumbnailUrl || submission.files[0].fileUrl}
                              alt="Content preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="text-center">
                                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm text-slate-600">Video Content</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Content Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Platforms:</span>
                          <div className="flex space-x-1">
                            {submission.platforms?.map((platform) => (
                              <Badge key={platform} variant="outline" className="text-xs">
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Amount:</span>
                          <span className="font-semibold text-green-600">
                            {submission.amount ? `$${submission.amount.toLocaleString()}` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-500">Submitted:</span>
                          <span className="text-slate-700">
                            {formatSafeDate(submission.submittedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Published Posts Performance */}
                      {submission.publishedPosts && submission.publishedPosts.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-green-900 mb-2">Published Posts</h4>
                          {submission.publishedPosts.map((post, index) => (
                            <div key={post.id || index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">{post.platform}</Badge>
                                <span className="text-green-800">{post.postType}</span>
                              </div>
                              {post.performance && (
                                <div className="flex items-center space-x-2 text-green-700">
                                  <Eye className="w-3 h-3" />
                                  <span>{post.performance.views.toLocaleString()}</span>
                                  <Heart className="w-3 h-3" />
                                  <span>{post.performance.likes.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {needsUrlSubmission(submission) && (
                          <Button 
                            onClick={() => navigate(`/campaigns/${submission.campaignId}/submit-urls/${submission.id}`)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            size="sm"
                          >
                            <LinkIcon className="w-3 h-3 mr-1" />
                            Submit URLs
                          </Button>
                        )}
                        
                        {submission.publishedPosts && submission.publishedPosts.length > 0 && (
                          <Button 
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              // Open first published post URL
                              if (submission.publishedPosts && submission.publishedPosts[0]) {
                                window.open(submission.publishedPosts[0].postUrl, '_blank')
                              }
                            }}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Post
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}