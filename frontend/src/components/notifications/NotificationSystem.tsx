import React, { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, AlertTriangle, Info, CreditCard, Users, MessageCircle } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'

interface Notification {
  id: string
  type: 'campaign_invite' | 'content_approval' | 'payment' | 'system' | 'collaboration'
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  avatar?: string
  metadata?: {
    campaignName?: string
    amount?: string
    influencerName?: string
  }
}

interface NotificationSystemProps {
  userRole: 'brand' | 'influencer'
}

export default function NotificationSystem({ userRole }: NotificationSystemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Mock notifications based on user role
  useEffect(() => {
    const mockNotifications: Notification[] = userRole === 'brand' ? [
      {
        id: '1',
        type: 'content_approval',
        title: 'New Content Submitted',
        message: 'Murugi Munyi submitted content for Summer Skincare campaign',
        timestamp: '5 minutes ago',
        read: false,
        avatar: '/api/placeholder/40/40',
        metadata: {
          campaignName: 'Summer Skincare Launch',
          influencerName: 'Murugi Munyi'
        }
      },
      {
        id: '2',
        type: 'collaboration',
        title: 'New Collaboration Request',
        message: 'Sarah Johnson wants to collaborate on your Fashion Week campaign',
        timestamp: '2 hours ago',
        read: false,
        avatar: '/api/placeholder/40/40',
        metadata: {
          campaignName: 'Fashion Week 2024',
          influencerName: 'Sarah Johnson'
        }
      },
      {
        id: '3',
        type: 'payment',
        title: 'Payment Processed',
        message: 'Payment of $250 has been sent to David Tech',
        timestamp: '1 day ago',
        read: true,
        metadata: {
          amount: '$250',
          influencerName: 'David Tech'
        }
      }
    ] : [
      {
        id: '1',
        type: 'campaign_invite',
        title: 'Campaign Invitation',
        message: 'NIVEA Kenya invited you to Summer Skincare Launch campaign',
        timestamp: '10 minutes ago',
        read: false,
        metadata: {
          campaignName: 'Summer Skincare Launch'
        }
      },
      {
        id: '2',
        type: 'content_approval',
        title: 'Content Approved',
        message: 'Your Instagram post for Fashion Week campaign has been approved',
        timestamp: '3 hours ago',
        read: false,
        metadata: {
          campaignName: 'Fashion Week 2024'
        }
      },
      {
        id: '3',
        type: 'payment',
        title: 'Payment Received',
        message: 'You received $200 for TikTok video content',
        timestamp: '2 days ago',
        read: true,
        metadata: {
          amount: '$200'
        }
      }
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }, [userRole])

  const getNotificationIcon = (type: Notification['type']) => {
    const iconProps = { className: "w-4 h-4" }
    
    switch (type) {
      case 'campaign_invite':
        return <Users {...iconProps} className="w-4 h-4 text-indigo-600" />
      case 'content_approval':
        return <CheckCircle {...iconProps} className="w-4 h-4 text-emerald-600" />
      case 'payment':
        return <CreditCard {...iconProps} className="w-4 h-4 text-yellow-600" />
      case 'collaboration':
        return <MessageCircle {...iconProps} className="w-4 h-4 text-blue-600" />
      case 'system':
      default:
        return <Info {...iconProps} className="w-4 h-4 text-slate-600" />
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'campaign_invite':
        return 'border-l-indigo-600 bg-indigo-50'
      case 'content_approval':
        return 'border-l-emerald-600 bg-emerald-50'
      case 'payment':
        return 'border-l-yellow-600 bg-yellow-50'
      case 'collaboration':
        return 'border-l-blue-600 bg-blue-50'
      case 'system':
      default:
        return 'border-l-slate-600 bg-slate-50'
    }
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    const notification = notifications.find(n => n.id === notificationId)
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-100 rounded-lg"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0 min-w-0"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Panel */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-slate-200 z-[9999] max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={markAllAsRead}
                    className="text-xs text-indigo-600 hover:text-indigo-700"
                  >
                    Mark all read
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors border-l-4 ${
                        !notification.read ? getNotificationColor(notification.type) : 'border-l-transparent bg-white'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Avatar (if available) */}
                        {notification.avatar && (
                          <img 
                            src={notification.avatar} 
                            alt="" 
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                        )}

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${
                                !notification.read ? 'text-slate-900' : 'text-slate-700'
                              }`}>
                                {notification.title}
                              </h4>
                              <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-500 mt-2">
                                {notification.timestamp}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-1 ml-2">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>

                          {/* Metadata */}
                          {notification.metadata && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {notification.metadata.campaignName && (
                                <Badge variant="outline" className="text-xs">
                                  {notification.metadata.campaignName}
                                </Badge>
                              )}
                              {notification.metadata.amount && (
                                <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-900">
                                  {notification.metadata.amount}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-200 bg-slate-50">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-indigo-600 hover:text-indigo-700"
                >
                  View All Notifications
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
