import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Link as LinkIcon, 
  Plus, 
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Instagram,
  ExternalLink,
  Calendar,
  Clock,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { contentService, ContentSubmission } from '../../services/content.service'
import { campaignService, Campaign } from '../../services/campaign.service'
import { formatSafeDate, formatSafeDatetime } from '../../utils/dateUtils'

interface LivePostUrl {
  id?: string
  platform: string
  postUrl: string
  postType: string
  publishedAt: string
  status?: 'PENDING_VERIFICATION' | 'VERIFIED' | 'INVALID_URL'
}

export default function SubmitLiveUrls() {
  const { campaignId, contentId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [contentSubmission, setContentSubmission] = useState<ContentSubmission | null>(null)
  const [liveUrls, setLiveUrls] = useState<LivePostUrl[]>([])
  const [existingPosts, setExistingPosts] = useState<any[]>([])

  // Platform options
  const platforms = [
    { value: 'Instagram', label: 'Instagram', icon: Instagram },
    { value: 'TikTok', label: 'TikTok', icon: LinkIcon },
    { value: 'YouTube', label: 'YouTube', icon: LinkIcon },
    { value: 'Twitter', label: 'Twitter/X', icon: LinkIcon },
  ]

  const postTypes = ['POST', 'STORY', 'REEL', 'VIDEO', 'SHORTS']

  useEffect(() => {
    if (campaignId && contentId) {
      loadData()
    } else {
      setError('Invalid URL parameters')
      setLoading(false)
    }
  }, [campaignId, contentId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [campaignData, contentData, publishedPosts] = await Promise.all([
        campaignService.getCampaign(campaignId!),
        contentService.getContentSubmission(contentId!),
        contentService.getPublishedPosts(contentId!).catch(() => []) // Don't fail if no posts exist
      ])

      setCampaign(campaignData)
      setContentSubmission(contentData)
      setExistingPosts(publishedPosts)

      // Initialize with one empty form if no existing posts
      if (publishedPosts.length === 0 && liveUrls.length === 0) {
        setLiveUrls([{
          platform: contentData.platforms?.[0] || 'Instagram',
          postUrl: '',
          postType: 'POST',
          publishedAt: new Date().toISOString().split('T')[0]
        }])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const addUrlForm = () => {
    setLiveUrls([...liveUrls, {
      platform: 'Instagram',
      postUrl: '',
      postType: 'POST',
      publishedAt: new Date().toISOString().split('T')[0]
    }])
  }

  const removeUrlForm = (index: number) => {
    setLiveUrls(liveUrls.filter((_, i) => i !== index))
  }

  const updateUrlForm = (index: number, field: keyof LivePostUrl, value: string) => {
    const updated = [...liveUrls]
    updated[index] = { ...updated[index], [field]: value }
    setLiveUrls(updated)
  }

  const validateUrls = (): string[] => {
    const errors: string[] = []
    
    liveUrls.forEach((urlData, index) => {
      if (!urlData.postUrl.trim()) {
        errors.push(`Post URL #${index + 1} is required`)
        return
      }

      const validation = contentService.validateSocialMediaUrl(urlData.postUrl, urlData.platform)
      if (!validation.isValid) {
        errors.push(`Post URL #${index + 1}: ${validation.error}`)
      }
    })

    return errors
  }

  const handleSubmit = async () => {
    const validationErrors = validateUrls()
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '))
      return
    }

    try {
      setSubmitting(true)
      setError(null)

      // Submit all URLs
      const submissions = liveUrls.map(urlData => 
        contentService.submitPublishedPost({
          contentId: contentId!,
          platform: urlData.platform,
          postUrl: urlData.postUrl,
          postType: urlData.postType,
          publishedAt: new Date(urlData.publishedAt).toISOString()
        })
      )

      await Promise.all(submissions)

      // Success - redirect to dashboard or content view
      navigate('/dashboard/influencer', {
        state: { 
          message: 'Live post URLs submitted successfully! Performance tracking will begin shortly.' 
        }
      })

    } catch (error) {
      console.error('Failed to submit URLs:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit URLs')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-600">Loading content details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error && !campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Content</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <div className="space-x-2">
              <Button onClick={loadData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard/influencer')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/influencer')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Submit Live Post URLs</h1>
              <p className="text-slate-600">{campaign?.title}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Content Overview */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <LinkIcon className="w-5 h-5" />
              <span>Content Submission Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Content Details</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Title:</strong> {contentSubmission?.title || 'Untitled'}</p>
                  <p><strong>Type:</strong> <Badge variant="secondary">{contentSubmission?.contentType}</Badge></p>
                  <p><strong>Submitted:</strong> {contentSubmission?.submittedAt ? formatSafeDate(contentSubmission.submittedAt) : 'Unknown'}</p>
                  <p><strong>Status:</strong> <Badge className={contentService.getStatusColor(contentSubmission?.status || 'PENDING')}>{contentSubmission?.status}</Badge></p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Target Platforms</h4>
                <div className="flex flex-wrap gap-2">
                  {contentSubmission?.platforms?.map((platform) => (
                    <Badge key={platform} variant="outline">{platform}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
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

        {/* Existing Posts */}
        {existingPosts.length > 0 && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle>Existing Live Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {existingPosts.map((post, index) => (
                  <div key={post.id || index} className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">{post.platform}</Badge>
                      <div>
                        <p className="font-medium text-slate-900">
                          {post.postType} - {formatSafeDate(post.publishedAt)}
                        </p>
                        <p className="text-sm text-slate-600 truncate max-w-md">{post.postUrl}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${post.status === 'VERIFIED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {post.status === 'VERIFIED' ? 'Verified' : 'Pending'}
                      </Badge>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={post.postUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* URL Submission Forms */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Add Live Post URLs</CardTitle>
              <Button onClick={addUrlForm} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Another URL
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {liveUrls.length === 0 ? (
              <div className="text-center py-8">
                <LinkIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No URLs Added Yet</h3>
                <p className="text-slate-600 mb-4">
                  Add the live URLs of your posted content for performance tracking.
                </p>
                <Button onClick={addUrlForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First URL
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {liveUrls.map((urlData, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-6 bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-slate-900">Post URL #{index + 1}</h4>
                      {liveUrls.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUrlForm(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Platform */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Platform *
                        </label>
                        <select
                          value={urlData.platform}
                          onChange={(e) => updateUrlForm(index, 'platform', e.target.value)}
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {platforms.map((platform) => (
                            <option key={platform.value} value={platform.value}>
                              {platform.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Post Type */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Post Type *
                        </label>
                        <select
                          value={urlData.postType}
                          onChange={(e) => updateUrlForm(index, 'postType', e.target.value)}
                          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {postTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Live URL */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Live Post URL *
                        </label>
                        <Input
                          type="url"
                          placeholder={`https://${urlData.platform.toLowerCase()}.com/...`}
                          value={urlData.postUrl}
                          onChange={(e) => updateUrlForm(index, 'postUrl', e.target.value)}
                          className="w-full"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Paste the direct link to your published post
                        </p>
                      </div>

                      {/* Published Date */}
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Published Date *
                        </label>
                        <Input
                          type="date"
                          value={urlData.publishedAt}
                          onChange={(e) => updateUrlForm(index, 'publishedAt', e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Info */}
        <Card className="shadow-lg border-0 bg-blue-50 border-blue-200 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="text-blue-500 mt-0.5">📊</div>
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Performance Tracking</h4>
                <p className="text-sm text-blue-800 mb-3">
                  Once you submit these URLs, our system will automatically begin tracking performance metrics including:
                </p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Views, likes, comments, and shares</li>
                  <li>• Engagement rate calculations</li>
                  <li>• Click-through rates (if applicable)</li>
                  <li>• Real-time analytics dashboard updates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        {liveUrls.length > 0 && (
          <div className="flex justify-end mt-8">
            <Button 
              onClick={handleSubmit}
              disabled={submitting}
              className="min-w-48 bg-primary hover:bg-primary/90"
              size="lg"
            >
              {submitting ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting URLs...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Live URLs</span>
                </div>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}