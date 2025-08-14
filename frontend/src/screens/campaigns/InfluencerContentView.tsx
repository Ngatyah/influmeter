import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Star,
  DollarSign,
  Eye,
  MessageCircle,
  Share2,
  CheckCheck,
  Wallet,
  TrendingUp,
  X,
  Loader2,
  ExternalLink,
  Heart
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Loading } from '../../components/ui/loading'
import NotificationSystem from '../../components/notifications/NotificationSystem'
import { usersService, User } from '../../services/users.service'
import { contentService, ContentSubmission } from '../../services/content.service'
import { paymentsService } from '../../services/payments.service'
import { formatSafeDate } from '../../utils/dateUtils'
import { getFullUrl } from '../../lib/api'

export default function InfluencerContentView() {
  const navigate = useNavigate()
  const { campaignId, influencerId } = useParams()
  const [loading, setLoading] = useState(true)
  const [contentLoading, setContentLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedContentForPayment, setSelectedContentForPayment] = useState<ContentSubmission | null>(null)
  const [influencer, setInfluencer] = useState<User | null>(null)
  const [contentSubmissions, setContentSubmissions] = useState<ContentSubmission[]>([])
  const [contentStats, setContentStats] = useState({
    total: 0,
    totalPages: 0,
    hasMore: false
  })

  // Fetch real data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!campaignId || !influencerId) {
        setError('Missing campaign or influencer ID')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        
        // Fetch influencer profile and content in parallel
        const [influencerData, contentData] = await Promise.all([
          usersService.getUserById(influencerId),
          contentService.getInfluencerContentForCampaign(influencerId, campaignId)
        ])
        
        setInfluencer(influencerData)
        setContentSubmissions(contentData.contentSubmissions)
        setContentStats({
          total: contentData.total,
          totalPages: contentData.totalPages,
          hasMore: contentData.hasMore
        })
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [campaignId, influencerId])

  // Refresh content data
  const refreshContent = async () => {
    if (!campaignId || !influencerId) return
    
    try {
      setContentLoading(true)
      const contentData = await contentService.getInfluencerContentForCampaign(influencerId, campaignId)
      setContentSubmissions(contentData.contentSubmissions)
      setContentStats({
        total: contentData.total,
        totalPages: contentData.totalPages,
        hasMore: contentData.hasMore
      })
    } catch (error) {
      console.error('Error refreshing content:', error)
      setError('Failed to refresh content')
    } finally {
      setContentLoading(false)
    }
  }

  const handleMarkCompleted = async (contentId: string) => {
    try {
      await contentService.updateContentStatus(contentId, 'COMPLETED', 'Content marked as completed')
      await refreshContent() // Refresh to get updated data
    } catch (error) {
      console.error('Error marking content as completed:', error)
      setError('Failed to mark content as completed')
    }
  }

  const handlePayContent = (content: ContentSubmission) => {
    setSelectedContentForPayment(content)
    setShowPaymentModal(true)
  }

  const handlePaymentComplete = async (contentId: string) => {
    try {
      // Create and process payment through the payment service
      if (!selectedContentForPayment) return
      
      // Create payment for the content
      const payment = await paymentsService.createContentPayment(contentId, {
        influencerId: influencerId!,
        amount: selectedContentForPayment.amount || 0,
        paymentMethod: 'bank_transfer'
      })
      
      // Process the payment immediately (in production, this would be handled differently)
      await paymentsService.processPayment(payment.id, {
        paymentMethod: 'bank_transfer',
        transactionId: `TXN_${Date.now()}`
      })
      
      await refreshContent() // Refresh to get updated data
      setShowPaymentModal(false)
      setSelectedContentForPayment(null)
    } catch (error) {
      console.error('Error processing payment:', error)
      setError('Failed to process payment')
    }
  }

  const handlePayAllCompleted = async () => {
    const completedContent = contentSubmissions.filter(c => c.status === 'COMPLETED')
    
    try {
      // Process all payments in parallel
      await Promise.all(
        completedContent.map(async (content) => {
          const payment = await paymentsService.createContentPayment(content.id, {
            influencerId: influencerId!,
            amount: content.amount || 0,
            paymentMethod: 'bank_transfer'
          })
          
          await paymentsService.processPayment(payment.id, {
            paymentMethod: 'bank_transfer',
            transactionId: `TXN_${Date.now()}_${content.id}`
          })
        })
      )
      await refreshContent() // Refresh to get updated data
    } catch (error) {
      console.error('Error processing bulk payment:', error)
      setError('Failed to process bulk payments')
    }
  }

  // Calculate payment stats from real data
  const pendingAmount = contentSubmissions
    .filter(c => c.status === 'PENDING')
    .reduce((sum, content) => sum + (content.amount || 0), 0)
  
  const approvedAmount = contentSubmissions
    .filter(c => c.status === 'APPROVED')
    .reduce((sum, content) => sum + (content.amount || 0), 0)
  
  const readyToPayAmount = contentSubmissions
    .filter(c => c.status === 'COMPLETED')
    .reduce((sum, content) => sum + (content.amount || 0), 0)
  
  const alreadyPaidAmount = contentSubmissions
    .filter(c => c.status === 'PAID')
    .reduce((sum, content) => sum + (content.amount || 0), 0)

  const totalAmount = pendingAmount + approvedAmount + readyToPayAmount + alreadyPaidAmount
  const completedContent = contentSubmissions.filter(c => c.status === 'COMPLETED')

  // Helper functions
  const getDisplayName = (user: User): string => {
    return usersService.getDisplayName(user)
  }

  const getAvatarUrl = (user: User): string => {
    return getFullUrl(user.profile?.avatarUrl)
  }

  const getFollowerCount = (user: User): string => {
    return usersService.formatFollowerCount(user.influencerProfile?.followers)
  }

  // Using formatSafeDate from utils instead

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Loading size="lg" text="Loading influencer content..." />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show message if no data
  if (!influencer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-600 mb-2">Influencer Not Found</h2>
            <p className="text-gray-600 mb-4">The requested influencer could not be found.</p>
            <Button 
              onClick={() => navigate(`/campaigns/${campaignId}`)} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              Back to Campaign
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/campaigns/${campaignId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaign
            </Button>
            <div className="flex items-center space-x-3">
              <img 
                src={getAvatarUrl(influencer)} 
                alt={getDisplayName(influencer)}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-semibold text-slate-900">{getDisplayName(influencer)}</h1>
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-slate-600">@{influencer.profile?.firstName?.toLowerCase() || 'user'}</p>
                <p className="text-sm text-slate-500">
                  {getFollowerCount(influencer)} followers • {influencer.influencerProfile?.averageEngagement || 0}% engagement
                </p>
              </div>
            </div>
          </div>
          
          {/* Add notifications */}
          <div className="flex items-center space-x-4">
            <NotificationSystem userRole="brand" />
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Payment Overview Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Campaign Value</p>
                  <p className="text-2xl font-bold text-slate-900">${totalAmount}</p>
                </div>
                <Wallet className="w-8 h-8 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-emerald-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600">Ready to Pay</p>
                  <p className="text-2xl font-bold text-emerald-700">${readyToPayAmount}</p>
                </div>
                <CreditCard className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-indigo-50 border-indigo-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-indigo-600">Already Paid</p>
                  <p className="text-2xl font-bold text-indigo-700">${alreadyPaidAmount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-slate-50 border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">In Progress</p>
                  <p className="text-2xl font-bold text-slate-700">${pendingAmount + approvedAmount}</p>
                </div>
                <Clock className="w-8 h-8 text-slate-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Actions */}
        {readyToPayAmount > 0 && (
          <Card className="mb-6 border border-emerald-200 bg-emerald-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="font-medium text-emerald-900">
                      {contentSubmissions.filter(c => c.status === 'COMPLETED').length} content pieces ready for payment
                    </p>
                    <p className="text-sm text-emerald-700">
                      Total amount: ${readyToPayAmount}
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={handlePayAllCompleted}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay All (${readyToPayAmount})
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Progress Bar */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-900">Payment Progress</h3>
              <span className="text-sm text-slate-600">
                ${alreadyPaidAmount} of ${totalAmount} paid
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalAmount > 0 ? (alreadyPaidAmount / totalAmount) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>0%</span>
              <span className="font-medium">{totalAmount > 0 ? ((alreadyPaidAmount / totalAmount) * 100).toFixed(1) : 0}% completed</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>

        {/* Content Submissions Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Content Submissions ({contentSubmissions.length})</h2>
          <div className="flex space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span>{contentSubmissions.filter(c => c.status === 'PAID').length} Paid</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>{contentSubmissions.filter(c => c.status === 'COMPLETED').length} Completed</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{contentSubmissions.filter(c => c.status === 'APPROVED').length} Approved</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>{contentSubmissions.filter(c => c.status === 'PENDING').length} Pending</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {contentLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Refreshing content...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {contentSubmissions.map((content) => (
              <ContentCard 
                key={content.id}
                content={content}
                onMarkCompleted={handleMarkCompleted}
                onPayContent={() => handlePayContent(content)}
                onApproveContent={(id) => contentService.approveContent(id).then(refreshContent)}
                onRejectContent={(id, feedback) => contentService.rejectContent(id, feedback).then(refreshContent)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!contentLoading && contentSubmissions.length === 0 && (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No content submissions yet</h3>
            <p className="text-slate-600">Content will appear here once the influencer starts submitting.</p>
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {showPaymentModal && selectedContentForPayment && (
        <PaymentModal
          content={selectedContentForPayment}
          influencer={influencer}
          onClose={() => {
            setShowPaymentModal(false)
            setSelectedContentForPayment(null)
          }}
          onPaymentComplete={() => handlePaymentComplete(selectedContentForPayment.id)}
        />
      )}
    </div>
  )
}

// Enhanced ContentCard component
function ContentCard({ 
  content, 
  onMarkCompleted, 
  onPayContent,
  onApproveContent,
  onRejectContent
}: { 
  content: ContentSubmission
  onMarkCompleted: (id: string) => void
  onPayContent: () => void
  onApproveContent: (id: string) => void
  onRejectContent: (id: string, feedback?: string) => void
}) {
  const getStatusBadge = (status: ContentSubmission['status']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-900">🕒 Pending</Badge>
      case 'APPROVED':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">✅ Approved</Badge>
      case 'COMPLETED':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">🎯 Completed</Badge>
      case 'PAID':
        return <Badge variant="default" className="bg-indigo-100 text-indigo-800">💰 Paid</Badge>
      case 'REJECTED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">❌ Rejected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  // Using formatSafeDate from utils instead

  const getContentThumbnail = (): string => {
    if (content.files && content.files.length > 0) {
      return getFullUrl(content.files[0].thumbnailUrl || content.files[0].fileUrl)
    }
    return getFullUrl('/api/placeholder/300/300')
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {/* Content Image */}
          <div className="flex-shrink-0">
            <img 
              src={getContentThumbnail()} 
              alt="Content"
              className="w-32 h-32 object-cover rounded-lg bg-slate-200"
            />
          </div>
          
          {/* Content Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              {getStatusBadge(content.status)}
              <span className="text-sm text-slate-600">{content.contentType}</span>
            </div>
            
            <h3 className="font-medium text-slate-900 mb-1">{content.title || 'Untitled'}</h3>
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {content.description || content.caption || 'No description'}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {content.platforms.map((platform) => (
                <Badge key={platform} variant="outline" className="text-xs">
                  {platform}
                </Badge>
              ))}
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-900">${content.amount || 0}</span>
              </div>
              <div className="text-xs text-slate-600">
                Submitted {formatSafeDate(content.submittedAt)}
              </div>
            </div>
          </div>
        </div>
        
       
        
        {/* Live URLs Section - NEW */}
        {content.publishedPosts && content.publishedPosts.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-green-900 flex items-center">
                <ExternalLink className="w-4 h-4 mr-1" />
                Live Posts ({content.publishedPosts.length})
              </h4>
              <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                Analytics Ready
              </Badge>
            </div>
            <div className="space-y-2">
              {content.publishedPosts.map((post, index) => (
                <div key={post.id || index} className="flex items-center justify-between text-sm bg-white p-2 rounded border border-green-200">
                  <div className="flex items-center space-x-2 flex-1">
                    <Badge variant="outline" className="text-xs">
                      {post.platform}
                    </Badge>
                    <span className="text-green-800 font-medium">{post.postType || 'POST'}</span>
                    <span className="text-xs text-green-600">
                      {formatSafeDate(post.publishedAt)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {post.performance && (
                      <div className="flex items-center space-x-2 text-green-700">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span className="text-xs">{post.performance.views?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3" />
                          <span className="text-xs">{post.performance.likes?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-3 h-3" />
                          <span className="text-xs">{post.performance.comments?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                    )}
                    <Button variant="ghost" size="sm" asChild className="h-6 px-2">
                      <a 
                        href={post.postUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Analytics Summary */}
            {content.publishedPosts.some(post => post.performance) && (
              <div className="mt-3 p-2 bg-green-100 rounded border border-green-300">
                <div className="text-xs text-green-800 font-medium mb-1">Total Performance:</div>
                <div className="grid grid-cols-3 gap-2 text-xs text-green-700">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>
                      {content.publishedPosts
                        .reduce((sum, post) => sum + (post.performance?.views || 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>
                      {content.publishedPosts
                        .reduce((sum, post) => sum + (post.performance?.likes || 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>
                      {content.publishedPosts
                        .reduce((sum, post) => sum + (post.performance?.comments || 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* No Live Posts Message - NEW */}
        {(content.status === 'APPROVED' || content.status === 'COMPLETED') && 
         (!content.publishedPosts || content.publishedPosts.length === 0) && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-800">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">Waiting for Live URLs</span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Influencer needs to submit live post URLs for analytics tracking
            </p>
          </div>
        )}
        
        {/* Enhanced Action Buttons */}
        <div className="space-y-2 mt-4">
          {content.status === 'PENDING' && (
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                onClick={() => onApproveContent(content.id)}
              >
                ✓ Approve
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600 border-red-600 hover:bg-red-50 flex-1"
                onClick={() => onRejectContent(content.id, 'Content needs revision')}
              >
                ✗ Reject
              </Button>
            </div>
          )}
          
          {content.status === 'APPROVED' && (
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => onMarkCompleted(content.id)}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark as Completed
            </Button>
          )}
          
          {content.status === 'COMPLETED' && (
            <Button 
              size="sm" 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={onPayContent}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ${content.amount || 0}
            </Button>
          )}

          {content.status === 'REJECTED' && (
            <div className="space-y-2">
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {content.feedback || 'Content was rejected'}
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="bg-emerald-600 hover:bg-emerald-700 flex-1"
                  onClick={() => onApproveContent(content.id)}
                >
                  ✓ Approve
                </Button>
              </div>
            </div>
          )}

          {content.status === 'PAID' && (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 py-2 text-sm text-indigo-600">
                <CheckCircle className="w-4 h-4" />
                <span>Payment Completed</span>
              </div>
              {content.performance && (
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{content.performance.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{content.performance.comments}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// New Payment Modal Component
function PaymentModal({ 
  content, 
  influencer, 
  onClose, 
  onPaymentComplete 
}: {
  content: ContentSubmission
  influencer: User
  onClose: () => void
  onPaymentComplete: () => void
}) {
  const [step, setStep] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [processing, setProcessing] = useState(false)
  
  const steps = ['Review Content', 'Payment Method', 'Process Payment', 'Confirmation']

  const handleProcessPayment = async () => {
    setProcessing(true)
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setProcessing(false)
    setStep(3)
  }

  const handleComplete = () => {
    onPaymentComplete()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Pay for Content: {content.contentType}
              </h2>
              <p className="text-sm text-slate-600">{influencer ? usersService.getDisplayName(influencer) : 'Unknown'} • ${content.amount || 0}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-slate-50">
          <div className="flex items-center justify-between">
            {steps.map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${index <= step 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-200 text-slate-600'
                  }
                `}>
                  {index + 1}
                </div>
                <span className="ml-2 text-sm hidden sm:block">{stepName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Content Review</h3>
              <div className="flex space-x-4">
                <img src={getFullUrl(content.files?.[0]?.thumbnailUrl)} alt="Content" className="w-32 h-32 object-cover rounded-lg" />
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 mb-1">{content.title || 'Untitled'}</h4>
                  <p className="text-slate-600 mb-2">{content.description || content.caption || 'No description'}</p>
                  <div className="flex flex-wrap gap-2">
                    {content.platforms.map(platform => (
                      <Badge key={platform} variant="outline">{platform}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Method</h3>
              <div className="space-y-3">
                {['M-Pesa', 'Bank Transfer', 'PayPal'].map(method => (
                  <div key={method} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id={method}
                      name="paymentMethod"
                      value={method.toLowerCase()}
                      checked={paymentMethod === method.toLowerCase()}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <label htmlFor={method} className="text-slate-700">{method}</label>
                  </div>
                ))}
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span>Content Payment:</span>
                  <span>${content.amount || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (5%):</span>
                  <span>-${((content.amount || 0) * 0.05).toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total to Pay:</span>
                  <span className="text-emerald-600">${((content.amount || 0) * 0.95).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                {processing ? (
                  <Clock className="w-8 h-8 text-emerald-600 animate-spin" />
                ) : (
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                )}
              </div>
              <h3 className="text-lg font-semibold">
                {processing ? 'Processing Payment...' : 'Payment Successful!'}
              </h3>
              <p className="text-slate-600">
                {processing 
                  ? `Processing payment of $${content.amount || 0} via ${paymentMethod}`
                  : `Payment of $${content.amount || 0} has been sent to ${influencer ? usersService.getDisplayName(influencer) : 'Unknown'}`
                }
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold">Payment Completed!</h3>
              <p className="text-slate-600">
                ${content.amount || 0} has been successfully paid to {influencer ? usersService.getDisplayName(influencer) : 'Unknown'} for "{content.title || 'content submission'}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          
          <div className="flex space-x-3">
            {step > 0 && step < 3 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}
            
            {step < 2 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !paymentMethod}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Next
              </Button>
            ) : step === 2 ? (
              <Button
                onClick={handleProcessPayment}
                disabled={processing}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {processing ? 'Processing...' : 'Process Payment'}
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}