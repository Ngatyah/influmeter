import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Star,
  Users,
  TrendingUp,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Instagram,
  Youtube,
  Globe,
  MapPin,
  Calendar,
  Award,
  Briefcase,
  Mail,
  ExternalLink,
  Play,
  Grid3X3,
  BarChart3,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { formatSafeDate } from '../../utils/dateUtils'
import { profileService, InfluencerProfile as InfluencerProfileType } from '../../services/profile.service'
import { inquiryService } from '../../services/inquiry.service'
import ContactInfluencerModal from '../../components/ContactInfluencerModal'

export default function InfluencerProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [influencer, setInfluencer] = useState<InfluencerProfileType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<any>(null)

  const loadProfile = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      setError(null)
      const profileData = await profileService.getInfluencerProfile(id)
      setInfluencer(profileData)
    } catch (error) {
      console.error('Failed to load influencer profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [id])

  const retryLoad = () => {
    loadProfile()
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatCurrency = (amount: number) => `$${amount}`

  const handleGetQuote = (pkg: any) => {
    setSelectedPackage(pkg)
    setShowContactModal(true)
  }

  const handleInquirySubmit = async (inquiryData: any) => {
    await inquiryService.createInquiry(inquiryData)
    setShowContactModal(false)
    setSelectedPackage(null)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm p-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-slate-600">Loading influencer profile...</p>
          </div>
        </Card>
      </div>
    )
  }

  // Error state
  if (error || !influencer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm p-8 max-w-md">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Profile Not Found</h3>
              <p className="text-slate-600 mb-4">
                {error || 'The influencer profile you are looking for does not exist or is not publicly available.'}
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={retryLoad}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share Profile
            </Button>
            <Button>
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {/* Cover Image & Profile Section */}
        <div className="relative">
          <div className="h-64 bg-gradient-to-r from-purple-500 to-pink-500 relative overflow-hidden">
            <img 
              src={influencer.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          
          <div className="relative px-6 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16">
              {/* Profile Picture */}
              <div className="relative mb-4 md:mb-0">
                <img 
                  src={influencer.avatar} 
                  alt={influencer.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                {influencer.verified && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="flex-1">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <h1 className="text-2xl font-bold text-slate-900">{influencer.name}</h1>
                      <p className="text-slate-600">{influencer.username}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{influencer.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Joined {formatSafeDate(influencer.joinedDate)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900">{formatNumber(influencer.metrics.totalReach)}</p>
                        <p className="text-sm text-slate-600">Total Reach</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{influencer.metrics.avgEngagement}%</p>
                        <p className="text-sm text-slate-600">Avg Engagement</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{influencer.metrics.trustScore}</p>
                        <p className="text-sm text-slate-600">Trust Score</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio & Quick Stats */}
        <div className="px-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bio */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-3">About</h3>
                  <p className="text-slate-700 leading-relaxed mb-4">{influencer.bio}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="secondary">{influencer.category}</Badge>
                    {influencer.languages.map((lang) => (
                      <Badge key={lang} variant="outline">{lang}</Badge>
                    ))}
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm">
                      <Instagram className="w-4 h-4 mr-2" />
                      Instagram
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Youtube className="w-4 h-4 mr-2" />
                      YouTube
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Globe className="w-4 h-4 mr-2" />
                      TikTok
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div>
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Campaigns Completed</span>
                    <span className="font-semibold">{influencer.metrics.totalCampaigns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Completion Rate</span>
                    <span className="font-semibold text-green-600">{influencer.metrics.completionRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Response Time</span>
                    <span className="font-semibold">{influencer.metrics.responseTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Trust Score</span>
                    <span className="font-semibold text-blue-600">{influencer.metrics.trustScore}/100</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="px-6 pb-8">
          <Tabs defaultValue="overview" key={influencer?.id}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Platform Stats</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="packages">Packages & Rates</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(influencer.socialMedia).map(([platform, data]) => (
                  <Card key={platform} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-500" />}
                          {platform === 'tiktok' && <Globe className="w-5 h-5" />}
                          {platform === 'youtube' && <Youtube className="w-5 h-5 text-red-500" />}
                          <CardTitle className="capitalize">{platform}</CardTitle>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-slate-600">Handle</p>
                        <p className="font-semibold">{data.handle}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-slate-600">Followers</p>
                          <p className="text-lg font-bold">{formatNumber(data.followers)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600">Posts</p>
                          <p className="text-lg font-bold">{data.posts}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Avg Engagement</p>
                        <p className="text-lg font-bold text-green-600">{data.engagement}%</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="portfolio" className="mt-6">
              {influencer.portfolio.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {influencer.portfolio.map((work) => (
                    <Card key={work.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer">
                      <div className="relative aspect-square">
                        <img 
                          src={work.thumbnail} 
                          alt={work.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                          <Play className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-1">{work.title}</h3>
                        <p className="text-sm text-slate-600 mb-2">{work.brand}</p>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                          <span>{work.platform} • {work.type}</span>
                          <span>{formatSafeDate(work.date)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-slate-600">Views</p>
                            <p className="font-semibold">{formatNumber(work.metrics.views)}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Likes</p>
                            <p className="font-semibold">{formatNumber(work.metrics.likes)}</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Eng Rate</p>
                            <p className="font-semibold text-green-600">{work.metrics.engagement}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No Portfolio Items Yet</h3>
                    <p className="text-slate-600">
                      This influencer hasn't completed any campaigns yet. Portfolio will automatically populate with completed campaign work.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="packages" className="mt-6">
              {influencer.packages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {influencer.packages.map((pkg) => (
                  <Card key={pkg.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{pkg.platform} - {pkg.type}</CardTitle>
                          <p className="text-2xl font-bold text-green-600 mt-1">
                            {formatCurrency(pkg.price)}
                          </p>
                        </div>
                        <Button onClick={() => handleGetQuote(pkg)}>
                          Get Quote
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h4 className="font-semibold mb-2">Deliverables:</h4>
                      <ul className="space-y-1">
                        {pkg.deliverables.map((item, index) => (
                          <li key={index} className="flex items-center text-sm text-slate-700">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              ) : (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📦</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No Packages Available</h3>
                    <p className="text-slate-600">
                      This influencer hasn't set up any service packages yet. Check back later for collaboration opportunities.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {influencer.reviews.map((review) => (
                  <Card key={review.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">{review.brand}</h3>
                          <p className="text-sm text-slate-600">{review.campaign}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-700 mb-2">{review.comment}</p>
                      <p className="text-xs text-slate-500">{formatSafeDate(review.date)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && selectedPackage && influencer && (
        <ContactInfluencerModal
          isOpen={showContactModal}
          onClose={() => {
            setShowContactModal(false)
            setSelectedPackage(null)
          }}
          influencer={{
            id: influencer.id,
            name: influencer.name,
            username: influencer.username,
            avatar: influencer.avatar
          }}
          packageDetails={selectedPackage}
          onSubmit={handleInquirySubmit}
        />
      )}
    </div>
  )
}
