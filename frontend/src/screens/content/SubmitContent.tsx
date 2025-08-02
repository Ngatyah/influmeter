import React, { useState } from 'react'
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
  Link
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Checkbox } from '../../components/ui/checkbox'

interface ContentSubmission {
  caption: string
  files: File[]
  platforms: string[]
  hashtags: string[]
  postUrl: string
  scheduledDate: string
  notes: string
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
  const [showSuccess, setShowSuccess] = useState(false)
  
  const [submission, setSubmission] = useState<ContentSubmission>({
    caption: '',
    files: [],
    platforms: [],
    hashtags: [],
    postUrl: '',
    scheduledDate: '',
    notes: ''
  })

  const [uploadedFiles, setUploadedFiles] = useState<ContentFile[]>([])
  const [dragActive, setDragActive] = useState(false)

  // Mock campaign data
  const campaign = {
    id: campaignId,
    title: 'Summer Skincare Collection Launch',
    brand: {
      name: 'NIVEA Kenya',
      logo: '/api/placeholder/60/60'
    },
    requirements: {
      platforms: ['Instagram', 'TikTok'],
      contentTypes: ['Reels', 'Stories', 'Static Posts'],
      hashtags: ['#NIVEASummer', '#NaturalGlow', '#SkincareRoutine'],
      deadline: '2024-05-10'
    },
    deliverables: [
      '2x Instagram Reels (15-30 seconds each)',
      '4x Instagram Stories',
      '1x Static feed post'
    ]
  }

  const platforms = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X']

  const handleInputChange = (field: keyof ContentSubmission, value: any) => {
    setSubmission(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const newFile: ContentFile = {
            file,
            type: file.type.startsWith('image/') ? 'image' : 'video',
            preview: e.target?.result as string
          }
          setUploadedFiles(prev => [...prev, newFile])
          setSubmission(prev => ({ ...prev, files: [...prev.files, file] }))
        }
        reader.readAsDataURL(file)
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
    setSubmission(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }))
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
      submission.caption.trim() !== '' &&
      uploadedFiles.length > 0 &&
      submission.platforms.length > 0
    )
  }

  const handleSubmit = async () => {
    if (!isFormValid()) return
    
    setIsSubmitting(true)
    
    // Simulate API call with FormData
    const formData = new FormData()
    formData.append('campaignId', campaignId || '')
    formData.append('caption', submission.caption)
    formData.append('platforms', JSON.stringify(submission.platforms))
    formData.append('hashtags', JSON.stringify(submission.hashtags))
    formData.append('postUrl', submission.postUrl)
    formData.append('scheduledDate', submission.scheduledDate)
    formData.append('notes', submission.notes)
    
    submission.files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsSubmitting(false)
    setShowSuccess(true)
    
    // Redirect after success
    setTimeout(() => {
      navigate('/dashboard/influencer')
    }, 3000)
  }

  if (showSuccess) {
    return <SuccessScreen campaign={campaign} />
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
              <p className="text-slate-600">{campaign.title}</p>
            </div>
          </div>
        </div>
      </header>

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
                  <li>• Include all required hashtags</li>
                  <li>• Tag the brand account (@niveakenya)</li>
                  <li>• Show products clearly and naturally</li>
                  <li>• Maintain authentic tone and style</li>
                  <li>• Submit high-quality files (HD/4K preferred)</li>
                </ul>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Upload Content Files *</CardTitle>
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
                    Support: JPG, PNG, MP4, MOV (Max 100MB per file)
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
                        <p className="text-xs text-slate-600 mt-1 truncate">
                          {file.file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content Details */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Content Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
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

                {/* Required Hashtags */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Required Hashtags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {campaign.requirements.hashtags.map((hashtag) => (
                      <Badge 
                        key={hashtag} 
                        className={`cursor-pointer ${
                          submission.hashtags.includes(hashtag) 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                        onClick={() => 
                          submission.hashtags.includes(hashtag) 
                            ? removeHashtag(hashtag)
                            : addHashtag(hashtag)
                        }
                      >
                        {hashtag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600">
                    Click to add/remove required hashtags
                  </p>
                </div>

                {/* Post URL (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Post URL (if already published)
                  </label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="https://instagram.com/p/your-post-id"
                      value={submission.postUrl}
                      onChange={(e) => handleInputChange('postUrl', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Optional: Provide link if content is already published
                  </p>
                </div>

                {/* Scheduled Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Scheduled Publication Date
                  </label>
                  <Input
                    type="datetime-local"
                    value={submission.scheduledDate}
                    onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Optional: When do you plan to publish this content?
                  </p>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    placeholder="Any additional information about your content, creative choices, or questions for the brand..."
                    value={submission.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="w-full h-24 p-3 border border-slate-200 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={500}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {submission.notes.length}/500 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/influencer')}
              >
                Save as Draft
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!isFormValid() || isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
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
                    src={campaign.brand.logo} 
                    alt={campaign.brand.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900">{campaign.brand.name}</h3>
                    <p className="text-sm text-slate-600">{campaign.title}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-slate-600">Deadline:</span>
                    <span className="text-sm font-medium text-slate-900">
                      {new Date(campaign.requirements.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deliverables Checklist */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Required Deliverables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {campaign.deliverables.map((deliverable, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                    <span className="text-sm text-slate-700">{deliverable}</span>
                  </div>
                ))}
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
                  <li>• Include all required hashtags</li>
                  <li>• Write engaging, authentic captions</li>
                  <li>• Tag the brand account correctly</li>
                  <li>• Show products naturally in use</li>
                  <li>• Follow brand voice and guidelines</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function SuccessScreen({ campaign }: { campaign: any }) {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm max-w-md w-full mx-6">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-xl font-bold text-slate-900 mb-2">Content Submitted!</h2>
          <p className="text-slate-600 mb-6">
            Your content for "{campaign.title}" has been submitted for review. 
            You'll receive a notification when {campaign.brand.name} reviews your submission.
          </p>

          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/dashboard/influencer')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
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
