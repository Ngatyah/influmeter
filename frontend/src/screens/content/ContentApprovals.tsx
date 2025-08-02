import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Edit3,
  Filter,
  Search,
  Calendar,
  Star,
  User,
  MessageSquare,
  Download,
  Play,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

interface ContentSubmission {
  id: string
  influencer: {
    name: string
    username: string
    avatar: string
    followers: string
    verified: boolean
  }
  campaign: {
    id: string
    title: string
  }
  content: {
    type: 'image' | 'video'
    files: string[]
    caption: string
    platforms: string[]
    hashtags: string[]
    postUrl?: string
  }
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested'
  feedback?: string
  scheduledDate?: string
}

// Move these functions outside the component
const getStatusColor = (status: ContentSubmission['status']) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'approved': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    case 'revision_requested': return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status: ContentSubmission['status']) => {
  switch (status) {
    case 'pending': return <Clock className="w-4 h-4" />
    case 'approved': return <CheckCircle className="w-4 h-4" />
    case 'rejected': return <XCircle className="w-4 h-4" />
    case 'revision_requested': return <Edit3 className="w-4 h-4" />
    default: return <AlertTriangle className="w-4 h-4" />
  }
}

export default function ContentApprovals() {
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState('pending')
  const [selectedSubmission, setSelectedSubmission] = useState<ContentSubmission | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - replace with API call
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([
    {
      id: '1',
      influencer: {
        name: 'Murugi Munyi',
        username: '@murugimunyi',
        avatar: '/api/placeholder/60/60',
        followers: '532K',
        verified: true
      },
      campaign: {
        id: '1',
        title: 'Summer Skincare Collection Launch'
      },
      content: {
        type: 'image',
        files: ['/api/placeholder/400/400', '/api/placeholder/400/500'],
        caption: 'Just tried the new @niveakenya summer collection! 🌞 My skin feels so hydrated and protected. Perfect for our Kenyan sun! #NIVEASummer #NaturalGlow #SkincareRoutine',
        platforms: ['Instagram', 'TikTok'],
        hashtags: ['#NIVEASummer', '#NaturalGlow', '#SkincareRoutine'],
        postUrl: 'https://instagram.com/p/example123'
      },
      submittedAt: '2024-04-25T10:30:00Z',
      status: 'pending',
      scheduledDate: '2024-04-26T18:00:00Z'
    },
    {
      id: '2',
      influencer: {
        name: 'David Tech',
        username: '@davidtech_ke',
        avatar: '/api/placeholder/60/60',
        followers: '128K',
        verified: false
      },
      campaign: {
        id: '2',
        title: 'Tech Gadget Review Campaign'
      },
      content: {
        type: 'video',
        files: ['/api/placeholder/400/600'],
        caption: 'Unboxing and testing the latest smartphone accessories! Check out my detailed review 📱⚡ #TechReview #Gadgets',
        platforms: ['YouTube', 'Instagram'],
        hashtags: ['#TechReview', '#Gadgets']
      },
      submittedAt: '2024-04-24T14:20:00Z',
      status: 'pending'
    },
    {
      id: '3',
      influencer: {
        name: 'Sarah Fitness',
        username: '@sarahfitness',
        avatar: '/api/placeholder/60/60',
        followers: '245K',
        verified: true
      },
      campaign: {
        id: '3',
        title: 'Fitness Challenge Content Series'
      },
      content: {
        type: 'video',
        files: ['/api/placeholder/400/600'],
        caption: 'Day 15 of the #FitLifeChallenge! 💪 Feeling stronger every day. Who\'s joining me? #FitnessMotivation #HealthyLiving',
        platforms: ['Instagram', 'TikTok'],
        hashtags: ['#FitLifeChallenge', '#FitnessMotivation', '#HealthyLiving']
      },
      submittedAt: '2024-04-23T16:45:00Z',
      status: 'approved'
    }
  ])

  const handleStatusChange = (submissionId: string, newStatus: ContentSubmission['status'], feedbackText?: string) => {
    setSubmissions(prev =>
      prev.map(submission =>
        submission.id === submissionId
          ? { ...submission, status: newStatus, feedback: feedbackText }
          : submission
      )
    )
    setShowDetailModal(false)
    setFeedback('')
  }

  const filteredSubmissions = submissions.filter(submission => {
    const matchesTab = selectedTab === 'all' || submission.status === selectedTab
    const matchesSearch = !searchTerm || 
      submission.influencer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.campaign.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTab && matchesSearch
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
              <h1 className="text-2xl font-semibold text-slate-900">Content Approvals</h1>
              <p className="text-slate-600">{filteredSubmissions.length} submissions to review</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Status Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({submissions.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({submissions.filter(s => s.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({submissions.filter(s => s.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="revision_requested">
              Revisions ({submissions.filter(s => s.status === 'revision_requested').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({submissions.filter(s => s.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Submissions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSubmissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              onViewDetails={(submission) => {
                setSelectedSubmission(submission)
                setShowDetailModal(true)
              }}
              onQuickAction={handleStatusChange}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredSubmissions.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No submissions found</h3>
            <p className="text-slate-600">
              {searchTerm ? 'Try adjusting your search terms' : 'No content submissions in this category'}
            </p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSubmission && (
        <SubmissionDetailModal
          submission={selectedSubmission}
          feedback={feedback}
          setFeedback={setFeedback}
          onClose={() => setShowDetailModal(false)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}

function SubmissionCard({ submission, onViewDetails, onQuickAction }: {
  submission: ContentSubmission
  onViewDetails: (submission: ContentSubmission) => void
  onQuickAction: (id: string, status: ContentSubmission['status']) => void
}) {
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <img 
              src={submission.influencer.avatar} 
              alt={submission.influencer.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <div className="flex items-center space-x-1">
                <h3 className="font-semibold text-slate-900">{submission.influencer.name}</h3>
                {submission.influencer.verified && <Star className="w-4 h-4 text-yellow-500" />}
              </div>
              <p className="text-sm text-slate-600">{submission.influencer.username}</p>
              <p className="text-xs text-slate-500">{submission.influencer.followers} followers</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(submission.status)} flex items-center space-x-1`}>
            {getStatusIcon(submission.status)}
            <span className="capitalize">{submission.status.replace('_', ' ')}</span>
          </Badge>
        </div>

        {/* Campaign Info */}
        <div className="mb-4">
          <p className="text-sm text-slate-600">Campaign:</p>
          <p className="font-medium text-slate-900">{submission.campaign.title}</p>
        </div>

        {/* Content Preview */}
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {submission.content.files.slice(0, 2).map((file, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden bg-slate-100 relative">
                {submission.content.type === 'image' ? (
                  <img src={file} alt="Content" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200">
                    <Play className="w-8 h-8 text-slate-500" />
                  </div>
                )}
                {submission.content.files.length > 2 && index === 1 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">+{submission.content.files.length - 2}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <p className="text-sm text-slate-700 line-clamp-2">{submission.content.caption}</p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {submission.content.platforms.map((platform) => (
              <Badge key={platform} variant="outline" className="text-xs">
                {platform}
              </Badge>
            ))}
          </div>
        </div>

        {/* Submission Details */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>Submitted {new Date(submission.submittedAt).toLocaleDateString()}</span>
          </div>
          {submission.scheduledDate && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Scheduled {new Date(submission.scheduledDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onViewDetails(submission)}
            className="flex-1"
          >
            <Eye className="w-3 h-3 mr-1" />
            View Details
          </Button>
          {submission.status === 'pending' && (
            <>
              <Button 
                size="sm" 
                onClick={() => onQuickAction(submission.id, 'approved')}
                className="bg-green-500 hover:bg-green-600"
              >
                <CheckCircle className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => onQuickAction(submission.id, 'rejected')}
              >
                <XCircle className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function SubmissionDetailModal({ submission, feedback, setFeedback, onClose, onStatusChange }: {
  submission: ContentSubmission
  feedback: string
  setFeedback: (feedback: string) => void
  onClose: () => void
  onStatusChange: (id: string, status: ContentSubmission['status'], feedback?: string) => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <img 
                src={submission.influencer.avatar} 
                alt={submission.influencer.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h2 className="text-xl font-semibold">{submission.influencer.name}</h2>
                <p className="text-slate-600">{submission.campaign.title}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Display */}
            <div>
              <h3 className="font-semibold mb-3">Content Files</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {submission.content.files.map((file, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                    {submission.content.type === 'image' ? (
                      <img src={file} alt="Content" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200">
                        <Play className="w-12 h-12 text-slate-500" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <h3 className="font-semibold mb-2">Caption</h3>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg mb-4">
                {submission.content.caption}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Platforms</h4>
                  <div className="flex flex-wrap gap-1">
                    {submission.content.platforms.map((platform) => (
                      <Badge key={platform} variant="secondary">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Hashtags</h4>
                  <div className="flex flex-wrap gap-1">
                    {submission.content.hashtags.map((hashtag) => (
                      <Badge key={hashtag} variant="outline" className="text-xs">
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Review Actions */}
            <div>
              <h3 className="font-semibold mb-3">Review Actions</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Feedback (Optional)
                  </label>
                  <textarea
                    placeholder="Provide feedback for the influencer..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full h-24 p-3 border border-slate-200 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <Button 
                    onClick={() => onStatusChange(submission.id, 'approved', feedback)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve Content
                  </Button>
                  
                  <Button 
                    onClick={() => onStatusChange(submission.id, 'revision_requested', feedback)}
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Request Revisions
                  </Button>
                  
                  <Button 
                    onClick={() => onStatusChange(submission.id, 'rejected', feedback)}
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Content
                  </Button>
                </div>

                {submission.content.postUrl && (
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      View Original Post
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
