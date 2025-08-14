import React, { useState } from 'react'
import { Clock, CheckCircle, XCircle, Star } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { formatSafeDatetime } from '../utils/dateUtils'

interface ApplicationReviewModalProps {
  application: any
  onClose: () => void
  onStatusUpdate: (applicationId: string, status: 'ACCEPTED' | 'REJECTED', message?: string) => void
}

export default function ApplicationReviewModal({ 
  application, 
  onClose, 
  onStatusUpdate 
}: ApplicationReviewModalProps) {
  const [feedback, setFeedback] = useState('')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <img 
                src={application.influencer?.profile?.avatarUrl || '/api/placeholder/60/60'}
                alt={`${application.influencer?.profile?.firstName || ''} ${application.influencer?.profile?.lastName || ''}`.trim() || 'Influencer'}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-semibold">
                    {`${application.influencer?.profile?.firstName || ''} ${application.influencer?.profile?.lastName || ''}`.trim() || 'Unknown'}
                  </h2>
                  {application.influencer?.influencerProfile?.verified && (
                    <Star className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <p className="text-slate-600">Campaign Application</p>
              </div>
            </div>
            <Button variant="ghost" onClick={onClose}>
              <XCircle className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Application Status */}
            <div className="p-4 rounded-lg border-2 border-dashed border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">Application Status</h3>
                  <p className="text-sm text-slate-600">Current status of this application</p>
                </div>
                <Badge 
                  className={`flex items-center space-x-1 ${
                    application.status === 'PENDING' ? 'bg-yellow-100 text-yellow-900' :
                    application.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {application.status === 'PENDING' && <Clock className="w-4 h-4" />}
                  {application.status === 'ACCEPTED' && <CheckCircle className="w-4 h-4" />}
                  {application.status === 'REJECTED' && <XCircle className="w-4 h-4" />}
                  <span className="capitalize">{application.status.toLowerCase()}</span>
                </Badge>
              </div>
            </div>

            {/* Application Details */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Application Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-600">Applied On</label>
                  <p className="text-slate-900">{formatSafeDatetime(application.appliedAt)}</p>
                </div>
                
                {application.applicationData?.message && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Message</label>
                    <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">
                      {application.applicationData.message}
                    </p>
                  </div>
                )}

                {application.applicationData?.proposedDeliverables && application.applicationData.proposedDeliverables.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Proposed Deliverables</label>
                    <ul className="text-slate-900 bg-slate-50 p-3 rounded-lg space-y-1">
                      {application.applicationData.proposedDeliverables.map((deliverable: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="text-slate-400 mr-2">•</span>
                          {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {application.applicationData?.motivation && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Motivation</label>
                    <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">
                      {application.applicationData.motivation}
                    </p>
                  </div>
                )}

                {application.applicationData?.contentIdeas && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Content Ideas</label>
                    <p className="text-slate-900 bg-slate-50 p-3 rounded-lg whitespace-pre-wrap">
                      {application.applicationData.contentIdeas}
                    </p>
                  </div>
                )}

                {application.applicationData?.proposedTimeline && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Proposed Timeline</label>
                    <p className="text-slate-900 bg-slate-50 p-3 rounded-lg">
                      {application.applicationData.proposedTimeline}
                    </p>
                  </div>
                )}

                {application.applicationData?.portfolioLinks && application.applicationData.portfolioLinks.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-slate-600">Portfolio Links</label>
                    <div className="space-y-2 bg-slate-50 p-3 rounded-lg">
                      {application.applicationData.portfolioLinks.filter((link: string) => link.trim()).map((link: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                          <a 
                            href={link.startsWith('http') ? link : `https://${link}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1 text-sm"
                          >
                            <span>{link}</span>
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Influencer Profile Info */}
            {application.influencer?.influencerProfile && (
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Influencer Profile</h3>
                <div className="space-y-3">
                  {application.influencer.influencerProfile.categories && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Categories</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {application.influencer.influencerProfile.categories.map((category: string) => (
                          <Badge key={category} variant="secondary" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {application.influencer.influencerProfile.niches && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Niches</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {application.influencer.influencerProfile.niches.map((niche: string) => (
                          <Badge key={niche} variant="outline" className="text-xs">
                            {niche}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.influencer.influencerProfile.languages && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Languages</label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {application.influencer.influencerProfile.languages.map((language: string) => (
                          <Badge key={language} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {application.influencer.influencerProfile.bio && (
                    <div>
                      <label className="text-sm font-medium text-slate-600">Bio</label>
                      <p className="text-slate-900 bg-slate-50 p-3 rounded-lg text-sm">
                        {application.influencer.influencerProfile.bio}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Media Stats */}
            {application.influencer?.socialAccounts && application.influencer.socialAccounts.length > 0 && (
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Social Media Presence</h3>
                <div className="space-y-3">
                  {application.influencer.socialAccounts.map((account: any, index: number) => (
                    <div key={index} className="bg-slate-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="font-medium text-slate-900 capitalize">{account.platform}</span>
                          {account.username && (
                            <span className="text-sm text-slate-600">@{account.username}</span>
                          )}
                          {account.isVerified && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        {account.followersCount && (
                          <div>
                            <span className="text-slate-600">Followers:</span>
                            <p className="font-semibold text-slate-900">
                              {account.followersCount >= 1000000 
                                ? `${(account.followersCount / 1000000).toFixed(1)}M`
                                : account.followersCount >= 1000 
                                ? `${(account.followersCount / 1000).toFixed(1)}K`
                                : account.followersCount.toLocaleString()
                              }
                            </p>
                          </div>
                        )}
                        {account.engagementRate && (
                          <div>
                            <span className="text-slate-600">Engagement:</span>
                            <p className="font-semibold text-slate-900">{account.engagementRate}%</p>
                          </div>
                        )}
                        {account.postsCount && (
                          <div>
                            <span className="text-slate-600">Posts:</span>
                            <p className="font-semibold text-slate-900">{account.postsCount.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Agreement Status */}
            {(application.applicationData?.agreedToTerms || application.applicationData?.agreedToExclusivity || application.applicationData?.agreedToDeadlines) && (
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Agreement Status</h3>
                <div className="bg-slate-50 p-3 rounded-lg space-y-2">
                  {application.applicationData.agreedToTerms && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-slate-700">Agreed to Terms & Conditions</span>
                    </div>
                  )}
                  {application.applicationData.agreedToExclusivity && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-slate-700">Agreed to Exclusivity Requirements</span>
                    </div>
                  )}
                  {application.applicationData.agreedToDeadlines && (
                    <div className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-slate-700">Agreed to Timeline & Deadlines</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {application.status === 'PENDING' && (
              <div>
                <h3 className="font-medium text-slate-900 mb-3">Review Actions</h3>
                
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
                      onClick={() => onStatusUpdate(application.id, 'ACCEPTED', feedback)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Application
                    </Button>
                    
                    <Button 
                      onClick={() => onStatusUpdate(application.id, 'REJECTED', feedback)}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Application
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {application.status !== 'PENDING' && (
              <div className="text-center py-8 bg-slate-50 rounded-lg">
                <p className="text-slate-600 mb-2">
                  This application has been {application.status.toLowerCase()}.
                </p>
                {application.respondedAt && (
                  <p className="text-sm text-slate-500">
                    Reviewed on {formatSafeDatetime(application.respondedAt)}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}