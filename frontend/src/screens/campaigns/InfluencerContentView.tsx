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
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import NotificationSystem from '../../components/notifications/NotificationSystem'

interface ContentSubmission {
  id: string
  type: 'Instagram Post' | 'Instagram Story' | 'TikTok Video' | 'YouTube Video' | 'Image'
  title: string
  description: string
  thumbnail: string
  submittedDate: string
  status: 'pending' | 'approved' | 'completed' | 'paid'
  amount: number
  engagement?: {
    views: string
    likes: string
    comments: string
    shares: string
  }
  platforms: string[]
  publishedDate?: string
}

interface Influencer {
  id: string
  name: string
  username: string
  avatar: string
  followers: string
  engagement: string
  joinedDate: string
  totalAmount: number
  completedAmount: number
  paidAmount: number
}

export default function InfluencerContentView() {
  const navigate = useNavigate()
  const { campaignId, influencerId } = useParams()
  const [loading, setLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedContentForPayment, setSelectedContentForPayment] = useState<ContentSubmission | null>(null)

  // Enhanced influencer data with payment tracking
  const [influencer, setInfluencer] = useState<Influencer>({
    id: '1',
    name: 'Murugi Munyi',
    username: '@murugimunyi',
    avatar: '/api/placeholder/100/100',
    followers: '532K',
    engagement: '8.4%',
    joinedDate: '4/16/2024',
    totalAmount: 650, // Total possible earnings
    completedAmount: 250, // Amount from completed content
    paidAmount: 0 // Amount already paid
  })

  // Enhanced content submissions with more payment data
  const [contentSubmissions, setContentSubmissions] = useState<ContentSubmission[]>([
    {
      id: '1',
      type: 'Instagram Post',
      title: 'NIVEA Summer Collection Post',
      description: 'Just tried the new @niveakenya summer collection! 😍 My skin feels so hydrated and smooth. Perfect for this Nairobi heat! 🌞 #NiveaKenya #SkinCare #Summer',
      thumbnail: '/api/placeholder/300/300',
      submittedDate: '4/20/2024',
      status: 'completed',
      amount: 250,
      platforms: ['Instagram', 'TikTok'],
      engagement: {
        views: '25.4K',
        likes: '2.1K',
        comments: '89',
        shares: '45'
      }
    },
    {
      id: '2',
      type: 'Instagram Story',
      title: 'Behind the Scenes Story',
      description: 'Story series showing the photoshoot process and brand experience.',
      thumbnail: '/api/placeholder/300/300',
      submittedDate: '4/19/2024',
      status: 'approved',
      amount: 150,
      platforms: ['Instagram']
    },
    {
      id: '3',
      type: 'TikTok Video',
      title: 'Skincare Routine Video',
      description: 'Quick morning routine video featuring NIVEA products',
      thumbnail: '/api/placeholder/300/300',
      submittedDate: '4/18/2024',
      status: 'paid',
      amount: 200,
      platforms: ['TikTok'],
      engagement: {
        views: '45.2K',
        likes: '3.8K',
        comments: '156',
        shares: '89'
      }
    },
    {
      id: '4',
      type: 'Instagram Post',
      title: 'Product Review Post',
      description: 'Detailed review of the summer skincare collection',
      thumbnail: '/api/placeholder/300/300',
      submittedDate: '4/17/2024',
      status: 'pending',
      amount: 250,
      platforms: ['Instagram']
    }
  ])

  const handleMarkCompleted = (contentId: string) => {
    setContentSubmissions(prev =>
      prev.map(content =>
        content.id === contentId
          ? { ...content, status: 'completed' as const }
          : content
      )
    )
  }

  const handlePayContent = (content: ContentSubmission) => {
    setSelectedContentForPayment(content)
    setShowPaymentModal(true)
  }

  const handlePaymentComplete = (contentId: string) => {
    setContentSubmissions(prev =>
      prev.map(content =>
        content.id === contentId
          ? { ...content, status: 'paid' as const }
          : content
      )
    )
    
    setInfluencer(prev => ({
      ...prev,
      paidAmount: prev.paidAmount + (selectedContentForPayment?.amount || 0)
    }))
    
    setShowPaymentModal(false)
    setSelectedContentForPayment(null)
  }

  const handlePayAllCompleted = () => {
    const completedContent = contentSubmissions.filter(c => c.status === 'completed')
    const totalAmount = completedContent.reduce((sum, content) => sum + content.amount, 0)
    console.log('Paying all completed content:', totalAmount)
  }

  // Calculate payment stats
  const pendingAmount = contentSubmissions
    .filter(c => c.status === 'pending')
    .reduce((sum, content) => sum + content.amount, 0)
  
  const approvedAmount = contentSubmissions
    .filter(c => c.status === 'approved')
    .reduce((sum, content) => sum + content.amount, 0)
  
  const readyToPayAmount = contentSubmissions
    .filter(c => c.status === 'completed')
    .reduce((sum, content) => sum + content.amount, 0)
  
  const alreadyPaidAmount = contentSubmissions
    .filter(c => c.status === 'paid')
    .reduce((sum, content) => sum + content.amount, 0)

  const completedContent = contentSubmissions.filter(c => c.status === 'completed')
  const totalCompletedAmount = completedContent.reduce((sum, content) => sum + content.amount, 0)

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
                src={influencer.avatar} 
                alt={influencer.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-semibold text-slate-900">{influencer.name}</h1>
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-slate-600">{influencer.username}</p>
                <p className="text-sm text-slate-500">
                  {influencer.followers} followers • {influencer.engagement} engagement
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
                  <p className="text-2xl font-bold text-slate-900">${influencer.totalAmount}</p>
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
                      {contentSubmissions.filter(c => c.status === 'completed').length} content pieces ready for payment
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
                ${alreadyPaidAmount} of ${influencer.totalAmount} paid
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(alreadyPaidAmount / influencer.totalAmount) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>0%</span>
              <span className="font-medium">{((alreadyPaidAmount / influencer.totalAmount) * 100).toFixed(1)}% completed</span>
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
              <span>{contentSubmissions.filter(c => c.status === 'paid').length} Paid</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>{contentSubmissions.filter(c => c.status === 'completed').length} Completed</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{contentSubmissions.filter(c => c.status === 'approved').length} Approved</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>{contentSubmissions.filter(c => c.status === 'pending').length} Pending</span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {contentSubmissions.map((content) => (
            <ContentCard 
              key={content.id}
              content={content}
              onMarkCompleted={handleMarkCompleted}
              onPayContent={() => handlePayContent(content)}
            />
          ))}
        </div>

        {/* Empty State */}
        {contentSubmissions.length === 0 && (
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
  onPayContent 
}: { 
  content: ContentSubmission
  onMarkCompleted: (id: string) => void
  onPayContent: () => void
}) {
  const getStatusBadge = (status: ContentSubmission['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">🕒 Pending</Badge>
      case 'approved':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">✅ Approved</Badge>
      case 'completed':
        return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">🎯 Completed</Badge>
      case 'paid':
        return <Badge variant="default" className="bg-indigo-100 text-indigo-800">💰 Paid</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all">
      <CardContent className="p-6">
        <div className="flex space-x-4">
          {/* Content Image */}
          <div className="flex-shrink-0">
            <img 
              src={content.thumbnail} 
              alt="Content"
              className="w-32 h-32 object-cover rounded-lg bg-slate-200"
            />
          </div>
          
          {/* Content Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              {getStatusBadge(content.status)}
              <span className="text-sm text-slate-600">{content.type}</span>
            </div>
            
            <p className="text-slate-900 mb-3 line-clamp-2">
              {content.description}
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
                <span className="font-semibold text-slate-900">${content.amount}</span>
              </div>
              <div className="text-xs text-slate-600">
                Submitted {content.submittedDate}
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Action Buttons */}
        <div className="space-y-2 mt-4">
          {content.status === 'pending' && (
            <div className="flex space-x-2">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 flex-1">
                ✓ Approve
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-50 flex-1">
                ✗ Reject
              </Button>
            </div>
          )}
          
          {content.status === 'approved' && (
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
          
          {content.status === 'completed' && (
            <Button 
              size="sm" 
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={onPayContent}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay ${content.amount}
            </Button>
          )}

          {content.status === 'paid' && (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2 py-2 text-sm text-indigo-600">
                <CheckCircle className="w-4 h-4" />
                <span>Payment Completed</span>
              </div>
              {content.engagement && (
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-3 h-3" />
                    <span>{content.engagement.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{content.engagement.comments}</span>
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
  influencer: Influencer
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
                Pay for Content: {content.type}
              </h2>
              <p className="text-sm text-slate-600">{influencer.name} • ${content.amount}</p>
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
                <img src={content.thumbnail} alt="Content" className="w-32 h-32 object-cover rounded-lg" />
                <div className="flex-1">
                  <p className="text-slate-900 mb-2">{content.description}</p>
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
                  <span>${content.amount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (5%):</span>
                  <span>-${(content.amount * 0.05).toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-semibold">
                  <span>Total to Pay:</span>
                  <span className="text-emerald-600">${(content.amount * 0.95).toFixed(2)}</span>
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
                  ? `Processing payment of $${content.amount} via ${paymentMethod}`
                  : `Payment of $${content.amount} has been sent to ${influencer.name}`
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
                ${content.amount} has been successfully paid to {influencer.name} for "{content.title}"
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
