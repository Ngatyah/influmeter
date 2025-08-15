import React, { useState, useEffect } from 'react'
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
  AlertTriangle,
  Loader2,
  RefreshCw,
  Camera
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { contentService, ContentSubmission } from '../../services/content.service'
import { formatSafeDate } from '../../utils/dateUtils'
import { getFullUrl } from '../../lib/api'

// Move these functions outside the component
const getStatusColor = (status: string) => {
  const normalizedStatus = status.toLowerCase()
  switch (normalizedStatus) {
    case 'pending': return 'bg-yellow-100 text-yellow-900'
    case 'approved': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    case 'completed': return 'bg-blue-100 text-blue-800'
    case 'paid': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status: string) => {
  const normalizedStatus = status.toLowerCase()
  switch (normalizedStatus) {
    case 'pending': return <Clock className="w-4 h-4" />
    case 'approved': return <CheckCircle className="w-4 h-4" />
    case 'rejected': return <XCircle className="w-4 h-4" />
    case 'completed': return <Edit3 className="w-4 h-4" />
    case 'paid': return <Star className="w-4 h-4" />
    default: return <AlertTriangle className="w-4 h-4" />
  }
}

export default function ContentApprovals() {
  const navigate = useNavigate()
  const [selectedTab, setSelectedTab] = useState('PENDING')
  const [selectedSubmission, setSelectedSubmission] = useState<ContentSubmission | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([])
  const [totalSubmissions, setTotalSubmissions] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      loadContentSubmissions()
    }, searchTerm ? 500 : 0) // Debounce search, but load immediately on tab change

    return () => clearTimeout(timer)
  }, [selectedTab, searchTerm])

  const loadContentSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters = {
        status: selectedTab === 'all' ? undefined : selectedTab as any,
        search: searchTerm || undefined,
        page: 1,
        limit: 20
      }

      const data = await contentService.getBrandContentSubmissions(filters)
      setSubmissions(data.contentSubmissions)
      setTotalSubmissions(data.total)
    } catch (error) {
      console.error('Failed to load content submissions:', error)
      setError(error instanceof Error ? error.message : 'Failed to load content submissions')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (submissionId: string, newStatus: 'APPROVED' | 'REJECTED', feedbackText?: string) => {
    try {
      setIsProcessing(true)
      setError(null)

      let updatedSubmission: ContentSubmission
      if (newStatus === 'APPROVED') {
        updatedSubmission = await contentService.approveContent(submissionId, feedbackText)
      } else {
        updatedSubmission = await contentService.rejectContent(submissionId, feedbackText)
      }

      // Update local state
      setSubmissions(prev =>
        prev.map(submission =>
          submission.id === submissionId ? updatedSubmission : submission
        )
      )

      setShowDetailModal(false)
      setFeedback('')
    } catch (error) {
      console.error('Failed to update status:', error)
      setError(error instanceof Error ? error.message : 'Failed to update content status')
    } finally {
      setIsProcessing(false)
    }
  }

  // Since we're filtering on the server side, we can just use submissions directly
  const filteredSubmissions = submissions

  // Helper function to get status counts
  const getStatusCounts = () => {
    const counts = {
      all: totalSubmissions,
      PENDING: submissions.filter(s => s.status === 'PENDING').length,
      APPROVED: submissions.filter(s => s.status === 'APPROVED').length,
      REJECTED: submissions.filter(s => s.status === 'REJECTED').length,
      COMPLETED: submissions.filter(s => s.status === 'COMPLETED').length,
    }
    return counts
  }

  const statusCounts = getStatusCounts()

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-600">Loading content submissions...</p>
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
              <h1 className="text-2xl font-semibold text-slate-900">Content Approvals</h1>
              <p className="text-slate-600">{totalSubmissions} submissions to review</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadContentSubmissions}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
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

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
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
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Status Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="PENDING">
              Pending ({statusCounts.PENDING})
            </TabsTrigger>
            <TabsTrigger value="APPROVED">
              Approved ({statusCounts.APPROVED})
            </TabsTrigger>
            <TabsTrigger value="REJECTED">
              Rejected ({statusCounts.REJECTED})
            </TabsTrigger>
            <TabsTrigger value="COMPLETED">
              Completed ({statusCounts.COMPLETED})
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
  onQuickAction: (id: string, status: 'APPROVED' | 'REJECTED') => void
}) {
  // Extract influencer info from the submission
  const influencerName = submission.influencer?.profile 
    ? `${submission.influencer.profile.firstName || ''} ${submission.influencer.profile.lastName || ''}`.trim() 
    : 'Influencer'
  
  const influencerUsername = submission.influencer?.profile?.firstName 
    ? `@${submission.influencer.profile.firstName.toLowerCase()}`
    : '@influencer'
    
  const influencerAvatar = submission.influencer?.profile?.avatarUrl
  
  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {influencerAvatar ? (
              <img 
                src={getFullUrl(influencerAvatar)} 
                alt={influencerName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="w-6 h-6 text-slate-500" />
              </div>
            )}
            <div>
              <div className="flex items-center space-x-1">
                <h3 className="font-semibold text-slate-900">{influencerName}</h3>
              </div>
              <p className="text-sm text-slate-600">{influencerUsername}</p>
            </div>
          </div>
          <Badge className={`${getStatusColor(submission.status)} flex items-center space-x-1`}>
            {getStatusIcon(submission.status)}
            <span className="capitalize">{submission.status.toLowerCase()}</span>
          </Badge>
        </div>

        {/* Campaign Info */}
        <div className="mb-4">
          <p className="text-sm text-slate-600">Campaign:</p>
          <p className="font-medium text-slate-900">{submission.campaign.title}</p>
        </div>

        {/* Content Preview */}
        <div className="mb-4">
          {submission.files && submission.files.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {submission.files.slice(0, 2).map((file, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-slate-100 relative">
                  {contentService.isImageFile(file.fileType) ? (
                    <img 
                      src={getFullUrl(file.thumbnailUrl || file.fileUrl)} 
                      alt="Content" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                      <Play className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                  {submission.files.length > 2 && index === 1 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">+{submission.files.length - 2}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <p className="text-sm text-slate-700 line-clamp-2">{submission.caption || 'No caption provided'}</p>
          
          <div className="flex flex-wrap gap-1 mt-2">
            {submission.platforms?.map((platform) => (
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
            <span>Submitted {formatSafeDate(submission.submittedAt)}</span>
          </div>
          {submission.amount && (
            <div className="flex items-center space-x-1">
              <span>${submission.amount}</span>
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
          {submission.status === 'PENDING' && (
            <>
              <Button 
                size="sm" 
                onClick={() => onQuickAction(submission.id, 'APPROVED')}
                className="bg-green-500 hover:bg-green-600"
              >
                <CheckCircle className="w-3 h-3" />
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => onQuickAction(submission.id, 'REJECTED')}
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
  onStatusChange: (id: string, status: 'APPROVED' | 'REJECTED', feedback?: string) => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const handleStatusChange = async (status: 'APPROVED' | 'REJECTED') => {
    setIsSubmitting(true)
    try {
      await onStatusChange(submission.id, status, feedback)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get influencer info
  const getInfluencerInfo = () => {
    const influencerName = submission.influencer?.profile 
      ? `${submission.influencer.profile.firstName || ''} ${submission.influencer.profile.lastName || ''}`.trim() 
      : 'Influencer'
    
    const influencerUsername = submission.influencer?.profile?.firstName 
      ? `@${submission.influencer.profile.firstName.toLowerCase()}`
      : '@influencer'
      
    const influencerAvatar = submission.influencer?.profile?.avatarUrl
    
    return {
      name: influencerName,
      username: influencerUsername,
      avatar: influencerAvatar
    }
  }

  const influencerInfo = getInfluencerInfo()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {influencerInfo.avatar ? (
                <img 
                  src={getFullUrl(influencerInfo.avatar)} 
                  alt={influencerInfo.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                  <User className="w-6 h-6 text-slate-500" />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold">{influencerInfo.name}</h2>
                  <Badge className={`${getStatusColor(submission.status)} flex items-center space-x-1`}>
                    {getStatusIcon(submission.status)}
                    <span className="capitalize">{submission.status.toLowerCase()}</span>
                  </Badge>
                </div>
                <p className="text-slate-600">{submission.campaign.title} • {influencerInfo.username}</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Content Display */}
            <div className="space-y-6">
              {/* Media Files */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Media Files</h3>
                  {submission.files && submission.files.length > 0 && (
                    <span className="text-sm text-slate-600">{submission.files.length} file(s)</span>
                  )}
                </div>
                
                {submission.files && submission.files.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main media display */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {submission.files.map((file, index) => (
                        <div key={file.id || index} className="group relative">
                          {contentService.isImageFile(file.fileType) ? (
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer hover:opacity-95 transition-opacity">
                              <img 
                                src={getFullUrl(file.thumbnailUrl || file.fileUrl)} 
                                alt={`Content ${index + 1}`}
                                className="w-full h-full object-cover" 
                                onClick={() => setSelectedImageIndex(index)}
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ) : contentService.isVideoFile(file.fileType) ? (
                            <div className="aspect-video rounded-lg overflow-hidden bg-slate-200 relative">
                              <video 
                                src={getFullUrl(file.fileUrl)}
                                className="w-full h-full object-cover"
                                controls
                                poster={getFullUrl(file.thumbnailUrl)}
                              />
                            </div>
                          ) : (
                            <div className="aspect-square rounded-lg bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-300">
                              <div className="text-center">
                                <Download className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                                <p className="text-sm text-slate-600">
                                  {file.fileType.split('/')[1]?.toUpperCase() || 'File'}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {contentService.formatFileSize(file.fileSize || 0)}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* File info overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 rounded-b-lg">
                            <div className="flex items-center justify-between text-white">
                              <span className="text-xs font-medium">
                                {file.fileType.split('/')[1]?.toUpperCase()}
                              </span>
                              <Button variant="ghost" size="sm" asChild className="h-6 px-2 text-white hover:bg-white/20">
                                <a href={getFullUrl(file.fileUrl)} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-3 h-3" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* File list */}
                    <div className="bg-slate-50 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-slate-700 mb-3">All Files</h4>
                      <div className="space-y-2">
                        {submission.files.map((file, index) => (
                          <div key={file.id || index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded bg-slate-200 flex items-center justify-center">
                                {contentService.isImageFile(file.fileType) ? (
                                  <Camera className="w-4 h-4 text-slate-500" />
                                ) : contentService.isVideoFile(file.fileType) ? (
                                  <Play className="w-4 h-4 text-slate-500" />
                                ) : (
                                  <Download className="w-4 h-4 text-slate-500" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-700">
                                  {file.fileType} • {contentService.formatFileSize(file.fileSize || 0)}
                                </p>
                                <p className="text-xs text-slate-500">
                                  Uploaded {formatSafeDate(file.createdAt)}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                              <a href={getFullUrl(file.fileUrl)} target="_blank" rel="noopener noreferrer">
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-8 rounded-lg text-center border-2 border-dashed border-slate-300">
                    <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">No media files uploaded</p>
                    <p className="text-slate-500 text-sm">The influencer hasn't uploaded any content files yet.</p>
                  </div>
                )}
              </div>

              {/* Content Details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Content Information</h3>
                </div>

                {/* Title */}
                {submission.title && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Title</label>
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <p className="text-slate-800">{submission.title}</p>
                    </div>
                  </div>
                )}

                {/* Description */}
                {submission.description && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                    <div className="bg-slate-50 p-3 rounded-lg border">
                      <p className="text-slate-800">{submission.description}</p>
                    </div>
                  </div>
                )}

                {/* Caption */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Caption</label>
                  <div className="bg-slate-50 p-3 rounded-lg border">
                    <p className="text-slate-800 whitespace-pre-wrap">
                      {submission.caption || 'No caption provided'}
                    </p>
                  </div>
                </div>

                {/* Content Type & Platforms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Content Type</label>
                    <Badge variant="secondary" className="text-sm">
                      {submission.contentType}
                    </Badge>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">Platforms</label>
                    <div className="flex flex-wrap gap-1">
                      {submission.platforms && submission.platforms.length > 0 ? (
                        submission.platforms.map((platform) => (
                          <Badge key={platform} variant="outline" className="text-sm">
                            {platform}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-slate-500 text-sm">No platforms specified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Hashtags</label>
                  <div className="flex flex-wrap gap-1">
                    {submission.hashtags && submission.hashtags.length > 0 ? (
                      submission.hashtags.map((hashtag) => (
                        <Badge key={hashtag} variant="outline" className="text-xs">
                          {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-slate-500 text-sm">No hashtags provided</span>
                    )}
                  </div>
                </div>

                {/* Amount */}
                {submission.amount && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Proposed Amount</label>
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <p className="text-lg font-bold text-green-700">${submission.amount.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {/* Submission Timeline */}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">Timeline</label>
                  <div className="bg-slate-50 p-3 rounded-lg border space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <span>Submitted: {formatSafeDate(submission.submittedAt)}</span>
                    </div>
                    {submission.approvedAt && (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Approved: {formatSafeDate(submission.approvedAt)}</span>
                      </div>
                    )}
                    {submission.completedAt && (
                      <div className="flex items-center space-x-2 text-sm text-blue-600">
                        <Edit3 className="w-4 h-4" />
                        <span>Completed: {formatSafeDate(submission.completedAt)}</span>
                      </div>
                    )}
                    {submission.paidAt && (
                      <div className="flex items-center space-x-2 text-sm text-purple-600">
                        <Star className="w-4 h-4" />
                        <span>Paid: {formatSafeDate(submission.paidAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Previous Feedback */}
                {submission.feedback && (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Previous Feedback</label>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-yellow-800">{submission.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Review Actions */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Review Actions</h3>
                
                {/* Current Status */}
                <div className="bg-slate-50 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Current Status</p>
                      <Badge className={`${getStatusColor(submission.status)} flex items-center space-x-1 w-fit`}>
                        {getStatusIcon(submission.status)}
                        <span className="capitalize">{submission.status.toLowerCase()}</span>
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Feedback Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Feedback for Influencer
                    </label>
                    <textarea
                      placeholder="Provide detailed feedback about the content submission..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="w-full h-32 p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                      disabled={isSubmitting}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      This feedback will be sent to the influencer along with your decision.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {submission.status === 'PENDING' ? (
                    <div className="grid grid-cols-1 gap-3">
                      <Button 
                        onClick={() => handleStatusChange('APPROVED')}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={isSubmitting}
                        size="lg"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5 mr-2" />
                        )}
                        Approve Content
                      </Button>
                      
                      <Button 
                        onClick={() => handleStatusChange('REJECTED')}
                        variant="destructive"
                        disabled={isSubmitting}
                        size="lg"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        ) : (
                          <XCircle className="w-5 h-5 mr-2" />
                        )}
                        Reject Content
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-slate-600 mb-3">
                        This content has been <span className="font-medium">{submission.status.toLowerCase()}</span>.
                      </p>
                      {submission.status === 'APPROVED' && (
                        <p className="text-sm text-green-600">
                          Content is ready for publication by the influencer.
                        </p>
                      )}
                      {submission.status === 'REJECTED' && (
                        <p className="text-sm text-red-600">
                          Content was rejected and needs to be resubmitted.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImageIndex !== null && submission.files && submission.files[selectedImageIndex] && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={getFullUrl(submission.files[selectedImageIndex].fileUrl)}
              alt={`Content preview ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            <Button 
              variant="ghost" 
              className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setSelectedImageIndex(null)}
            >
              <XCircle className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
