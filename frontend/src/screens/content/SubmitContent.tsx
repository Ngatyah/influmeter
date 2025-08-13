import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Upload, 
  Image, 
  Video, 
  FileText,
  CheckCircle,
  AlertCircle,
  X,
  Play,
  Eye,
  Calendar,
  DollarSign,
  Users,
  Tag,
  Link,
  Loader2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Checkbox } from '../../components/ui/checkbox'
import { contentService, CreateContentSubmissionData } from '../../services/content.service'
import { campaignService, Campaign } from '../../services/campaign.service'
import { formatSafeDate } from '../../utils/dateUtils'

interface ContentSubmission {
  title: string
  description: string
  caption: string
  hashtags: string[]
  platforms: string[]
  contentType: '' | 'IMAGE' | 'VIDEO' | 'STORY' | 'REEL' | 'POST'
  amount?: number
}

interface ContentFile {
  file: File
  type: 'image' | 'video'
  preview: string
}

export default function SubmitContent() {
  const { campaignId } = useParams()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [createdContentId, setCreatedContentId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const [submission, setSubmission] = useState<ContentSubmission>({
    title: '',
    description: '',
    caption: '',
    hashtags: [],
    platforms: [],
    contentType: 'POST',
    amount: undefined
  })

  const [uploadedFiles, setUploadedFiles] = useState<ContentFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploadLimits, setUploadLimits] = useState<any>(null)

  // Content types for selection
  const contentTypes = [
    { value: 'IMAGE', label: 'Image Post', icon: Image },
    { value: 'VIDEO', label: 'Video Post', icon: Video },
    { value: 'STORY', label: 'Story', icon: FileText },
    { value: 'REEL', label: 'Reel', icon: Play },
    { value: 'POST', label: 'General Post', icon: FileText },
  ]

  const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X']

  // Load campaign and upload limits
  useEffect(() => {
    if (campaignId) {
      loadCampaignData()
      loadUploadLimits()
    }
  }, [campaignId])

  const loadCampaignData = async () => {
    try {
      setLoading(true)
      setError(null)
      const campaignData = await campaignService.getCampaign(campaignId!)
      setCampaign(campaignData)
    } catch (error) {
      console.error('Failed to load campaign:', error)
      setError(error instanceof Error ? error.message : 'Failed to load campaign')
    } finally {
      setLoading(false)
    }
  }

  const loadUploadLimits = async () => {
    try {
      const limits = await contentService.getUploadLimits()
      setUploadLimits(limits)
    } catch (error) {
      console.error('Failed to load upload limits:', error)
    }
  }

  const handleInputChange = (field: keyof ContentSubmission, value: any) => {
    setSubmission(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    // Check file count limit
    const totalFiles = uploadedFiles.length + files.length
    if (uploadLimits && totalFiles > uploadLimits.maxFiles) {
      setError(`Maximum ${uploadLimits.maxFiles} files allowed`)
      return
    }

    Array.from(files).forEach(file => {
      // Check file size limit
      if (uploadLimits && file.size > uploadLimits.maxFileSize) {
        setError(`File "${file.name}" is too large. Maximum size is ${contentService.formatFileSize(uploadLimits.maxFileSize)}`)
        return
      }

      // Check file type
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newFile: ContentFile = {
            file,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            preview: e.target?.result as string
          }
          setUploadedFiles(prev => [...prev, newFile])
        }
        reader.readAsDataURL(file)
      } else {
        setError(`Invalid file type: ${file.name}. Only images and videos are allowed.`)
      }
    })
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handlePlatformToggle = (platform: string, checked: boolean) => {
    setSubmission(prev => ({
      ...prev,
      platforms: checked 
        ? [...prev.platforms, platform]
        : prev.platforms.filter(p => p !== platform)
    }))
  }

  const addHashtag = (hashtag: string) => {
    if (!submission.hashtags.includes(hashtag)) {
      setSubmission(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, hashtag]
      }))
    }
  }

  const removeHashtag = (hashtag: string) => {
    setSubmission(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== hashtag)
    }))
  }

  const isFormValid = () => {
    return (
      submission.title.trim() !== '' &&
      submission.caption.trim() !== '' &&
      uploadedFiles.length > 0 &&
      submission.platforms.length > 0 &&
      submission.contentType !== ''
    )
  }

  const handleSubmit = async () => {
    if (!isFormValid() || !campaignId) return
    
    try {
      setIsSubmitting(true)
      setError(null)

      // Step 1: Create content submission
      const contentData: CreateContentSubmissionData = {
        campaignId,
        title: submission.title,
        description: submission.description,
        caption: submission.caption,
        hashtags: submission.hashtags,
        platforms: submission.platforms,
        contentType: submission.contentType,
        amount: submission.amount
      }

      const createdContent = await contentService.createContentSubmission(contentData)
      setCreatedContentId(createdContent.id)

      // Step 2: Upload files if any
      if (uploadedFiles.length > 0) {
        setIsUploading(true)
        const files = uploadedFiles.map(f => f.file)
        await contentService.uploadFiles(createdContent.id, files)
        setIsUploading(false)
      }

      setIsSubmitting(false)
      setShowSuccess(true)
      
      // Redirect after success
      setTimeout(() => {
        navigate('/dashboard/influencer')
      }, 3000)

    } catch (error) {
      console.error('Failed to submit content:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit content')
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-slate-600">Loading campaign...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (!campaign && error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Campaign Not Found</h2>
            <p className="text-slate-600 mb-4">{error}</p>
            <div className="space-x-2">
              <Button onClick={loadCampaignData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button variant="outline" onClick={() => navigate('/campaigns/browse')}>
                Back to Campaigns
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return <SuccessScreen campaign={campaign} contentId={createdContentId} />
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
              <h1 className="text-2xl font-semibold text-slate-900">Submit Content</h1>
              <p className="text-slate-600">{campaign?.title}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 pt-4">
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

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Submission Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Submission Guidelines */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-slate-900">Content Guidelines</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Please ensure your content meets all campaign requirements before submission.
                    </p>
                  </div>
                </div>
                <ul className="text-sm text-slate-600 space-y-1 ml-8">
                  <li>• Include all required hashtags and mentions</li>
                  <li>• Show products clearly and naturally</li>
                  <li>• Maintain authentic tone and style</li>
                  <li>• Submit high-quality files (HD/4K preferred)</li>
                  <li>• Follow platform-specific guidelines</li>
                </ul>
              </CardContent>
            </Card>

            {/* Content Details */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Content Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Content Title *
                  </label>
                  <Input
                    placeholder="Give your content submission a clear title..."
                    value={submission.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {submission.title.length}/100 characters
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe your content concept, creative approach, and key messages..."
                    value={submission.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full h-24 p-3 border border-slate-200 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={500}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {submission.description.length}/500 characters
                  </p>
                </div>

                {/* Content Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Content Type *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {contentTypes.map((type) => {
                      const IconComponent = type.icon
                      return (
                        <div
                          key={type.value}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            submission.contentType === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                          onClick={() => handleInputChange('contentType', type.value)}
                        >
                          <div className="flex items-center space-x-2">
                            <IconComponent className="w-5 h-5 text-slate-600" />
                            <span className="text-sm font-medium">{type.label}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Caption */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Caption *
                  </label>
                  <textarea
                    placeholder="Write your post caption here. Include brand mentions, hashtags, and call-to-action..."
                    value={submission.caption}
                    onChange={(e) => handleInputChange('caption', e.target.value)}
                    className="w-full h-32 p-3 border border-slate-200 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={2200}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {submission.caption.length}/2200 characters
                  </p>
                </div>

                {/* Platforms */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Publishing Platforms *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {platforms.map((platform) => (
                      <div key={platform} className="flex items-center space-x-2">
                        <Checkbox
                          id={platform}
                          checked={submission.platforms.includes(platform)}
                          onCheckedChange={(checked) => handlePlatformToggle(platform, !!checked)}
                        />
                        <label htmlFor={platform} className="text-sm text-slate-700">
                          {platform}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Hashtags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {submission.hashtags.map((hashtag) => (
                      <Badge 
                        key={hashtag} 
                        className="bg-blue-500 text-white cursor-pointer"
                        onClick={() => removeHashtag(hashtag)}
                      >
                        {hashtag} <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="#hashtag"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          const input = e.target as HTMLInputElement
                          let hashtag = input.value.trim()
                          if (hashtag && !hashtag.startsWith('#')) {
                            hashtag = '#' + hashtag
                          }
                          if (hashtag && hashtag.length > 1) {
                            addHashtag(hashtag)
                            input.value = ''
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.querySelector('input[placeholder="#hashtag"]') as HTMLInputElement
                        if (input) {
                          let hashtag = input.value.trim()
                          if (hashtag && !hashtag.startsWith('#')) {
                            hashtag = '#' + hashtag
                          }
                          if (hashtag && hashtag.length > 1) {
                            addHashtag(hashtag)
                            input.value = ''
                          }
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    Press Enter or click Add to include hashtags
                  </p>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Proposed Amount (Optional)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="number"
                      placeholder="250"
                      value={submission.amount || ''}
                      onChange={(e) => handleInputChange('amount', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="pl-10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Optional: Suggest your rate for this content
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Upload Content Files *
                  {uploadLimits && (
                    <span className="text-sm text-slate-500 font-normal">
                      Max {uploadLimits.maxFiles} files, {contentService.formatFileSize(uploadLimits.maxFileSize)} each
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    Drop files here or click to browse
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {uploadLimits ? 
                      `Support: ${uploadLimits.allowedTypes.join(', ')} (Max ${contentService.formatFileSize(uploadLimits.maxFileSize)} per file)` :
                      'Support: JPG, PNG, MP4, MOV (Max 50MB per file)'
                    }
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                    Choose Files
                  </Button>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-blue-800">Uploading files...</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Uploaded Files Preview */}
                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                          {file.type === 'image' ? (
                            <img 
                              src={file.preview} 
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-200">
                              <Play className="w-8 h-8 text-slate-500" />
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="absolute top-2 right-2 w-6 h-6 p-0 bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        <div className="mt-2">
                          <p className="text-xs text-slate-600 truncate" title={file.file.name}>
                            {file.file.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {contentService.formatFileSize(file.file.size)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/influencer')}
                disabled={isSubmitting || isUploading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting || isUploading}
                className="min-w-32"
              >
                {isSubmitting || isUploading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isUploading ? 'Uploading...' : 'Submitting...'}</span>
                  </div>
                ) : (
                  'Submit for Review'
                )}
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Campaign Info */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={campaign?.brand?.brandProfile?.logoUrl || '/api/placeholder/60/60'} 
                    alt={campaign?.brand?.brandProfile?.companyName || 'Brand'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {campaign?.brand?.brandProfile?.companyName || 
                       `${campaign?.brand?.profile?.firstName || ''} ${campaign?.brand?.profile?.lastName || ''}`.trim() || 
                       'Brand'}
                    </h3>
                    <p className="text-sm text-slate-600">{campaign?.title}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-slate-600">Deadline:</span>
                    <span className="text-sm font-medium text-slate-900">
                      {campaign?.endDate ? formatSafeDate(campaign.endDate) : 'Not set'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-slate-600">Budget:</span>
                    <span className="text-sm font-medium text-slate-900">
                      {campaign?.budget ? `$${campaign.budget}` : 'TBD'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submission Tips */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">💡 Submission Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• Upload high-resolution files</li>
                  <li>• Write engaging, authentic captions</li>
                  <li>• Use relevant hashtags</li>
                  <li>• Show products naturally in use</li>
                  <li>• Follow brand voice and guidelines</li>
                  <li>• Include clear call-to-action</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function SuccessScreen({ campaign, contentId }: { campaign: Campaign | null; contentId: string | null }) {
  const navigate = useNavigate()
  const requiresApproval = campaign?.requiresApproval !== false // Default to true if not specified

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm max-w-lg w-full mx-6">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-2">Content Submitted!</h2>
          
          {requiresApproval ? (
            <div className="space-y-4 mb-6">
              <p className="text-slate-600">
                Your content for "{campaign?.title}" has been submitted for review. 
                You'll receive a notification when the brand reviews your submission.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-500 mt-0.5">ℹ️</div>
                  <div className="text-left">
                    <h4 className="font-medium text-blue-900 mb-1">Next Steps:</h4>
                    <ol className="text-sm text-blue-800 space-y-1">
                      <li>1. Wait for brand approval</li>
                      <li>2. Once approved, post on your social media</li>
                      <li>3. Submit live post URLs for performance tracking</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              <p className="text-slate-600">
                Your content for "{campaign?.title}" has been submitted successfully!
                You can now post this content on your social media platforms.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-green-500 mt-0.5">🚀</div>
                  <div className="text-left">
                    <h4 className="font-medium text-green-900 mb-1">Ready to Post!</h4>
                    <ol className="text-sm text-green-800 space-y-1">
                      <li>1. Post your content on the selected platforms</li>
                      <li>2. Return here to submit live post URLs</li>
                      <li>3. Performance tracking will begin automatically</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/dashboard/influencer')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
            {!requiresApproval && contentId && (
              <Button 
                onClick={() => navigate(`/campaigns/${campaign?.id}/submit-urls/${contentId}`)}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Submit Live Post URLs
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => navigate('/campaigns/browse')}
              className="w-full"
            >
              Browse More Campaigns
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}