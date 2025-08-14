import React, { useState } from 'react'
import { X, Send, User, Mail, Building, MessageSquare, Package, DollarSign } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'

interface PackageDetails {
  id: string
  platform: string
  type: string
  price: number
  deliverables: string[]
  title?: string
}

interface InfluencerDetails {
  id: string
  name: string
  username: string
  avatar: string
}

interface ContactInfluencerModalProps {
  isOpen: boolean
  onClose: () => void
  influencer: InfluencerDetails
  packageDetails: PackageDetails
  onSubmit: (inquiryData: any) => Promise<void>
}

export default function ContactInfluencerModal({
  isOpen,
  onClose,
  influencer,
  packageDetails,
  onSubmit
}: ContactInfluencerModalProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    message: '',
    budget: '',
    timeline: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const inquiryData = {
        influencerId: influencer.id,
        packageId: packageDetails.id,
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        message: formData.message,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        timeline: formData.timeline,
        packageDetails: {
          platform: packageDetails.platform,
          type: packageDetails.type,
          price: packageDetails.price,
          title: packageDetails.title
        }
      }

      await onSubmit(inquiryData)
      setSubmitted(true)
    } catch (error) {
      console.error('Failed to submit inquiry:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (amount: number) => `$${amount}`

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
        <div className="bg-white rounded-xl p-8 w-full max-w-md relative z-[10000]">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Inquiry Sent!</h3>
            <p className="text-slate-600 mb-6">
              Your inquiry has been sent to {influencer.name}. They'll get back to you soon!
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <img
              src={influencer.avatar}
              alt={influencer.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Contact {influencer.name}</h2>
              <p className="text-slate-600">@{influencer.username}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Package Details */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center">
            <Package className="w-4 h-4 mr-2" />
            Package Details
          </h3>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-slate-900">
                    {packageDetails.title || `${packageDetails.platform} ${packageDetails.type}`}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline">{packageDetails.platform}</Badge>
                    <Badge variant="outline">{packageDetails.type}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(packageDetails.price)}
                  </p>
                </div>
              </div>
              <div>
                <h5 className="font-medium text-sm text-slate-700 mb-2">Deliverables:</h5>
                <ul className="space-y-1">
                  {packageDetails.deliverables.map((item, index) => (
                    <li key={index} className="flex items-center text-sm text-slate-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Building className="w-4 h-4 inline mr-1" />
                Company Name *
              </label>
              <Input
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="Your company name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Contact Name *
              </label>
              <Input
                value={formData.contactName}
                onChange={(e) => handleChange('contactName', e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="your.email@company.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Budget Range (Optional)
              </label>
              <Input
                type="number"
                value={formData.budget}
                onChange={(e) => handleChange('budget', e.target.value)}
                placeholder="5000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Timeline (Optional)
              </label>
              <Input
                value={formData.timeline}
                onChange={(e) => handleChange('timeline', e.target.value)}
                placeholder="e.g., 2 weeks, ASAP, End of month"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              className="w-full h-32 p-3 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tell them about your campaign, brand, and what you're looking for..."
              required
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Inquiry
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}