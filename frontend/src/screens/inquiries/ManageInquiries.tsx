import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Mail,
  Clock,
  Building,
  User,
  DollarSign,
  MessageSquare,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import ErrorBoundary from '../../components/ErrorBoundary'
import { inquiryService, Inquiry } from '../../services/inquiry.service'
import { formatSafeDate } from '../../utils/dateUtils'

export default function ManageInquiries() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [selectedTab, setSelectedTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    loadInquiries()
  }, [selectedTab])

  const loadInquiries = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const statusFilter = selectedTab === 'all' ? undefined : selectedTab.toUpperCase()
      const response = await inquiryService.getReceivedInquiries({
        status: statusFilter,
        limit: 50
      })
      
      setInquiries(response.inquiries || [])
    } catch (error) {
      console.error('Failed to load inquiries:', error)
      setError(error instanceof Error ? error.message : 'Failed to load inquiries')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (inquiry: Inquiry, status: string, response?: string) => {
    try {
      await inquiryService.updateInquiryStatus(inquiry.id, { 
        status: status as any, 
        response 
      })
      
      // Reload inquiries
      loadInquiries()
      setShowDetail(false)
      setSelectedInquiry(null)
    } catch (error) {
      console.error('Failed to update inquiry status:', error)
    }
  }

  const filteredInquiries = inquiries.filter(inquiry => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    return (
      inquiry.companyName.toLowerCase().includes(searchLower) ||
      inquiry.contactName.toLowerCase().includes(searchLower) ||
      inquiry.email.toLowerCase().includes(searchLower) ||
      inquiry.message.toLowerCase().includes(searchLower)
    )
  })

  const getInquiryCounts = () => {
    return {
      all: inquiries.length,
      pending: inquiries.filter(i => i.status === 'PENDING').length,
      contacted: inquiries.filter(i => i.status === 'CONTACTED').length,
      negotiating: inquiries.filter(i => i.status === 'NEGOTIATING').length,
      accepted: inquiries.filter(i => i.status === 'ACCEPTED').length,
      declined: inquiries.filter(i => i.status === 'DECLINED').length,
      completed: inquiries.filter(i => i.status === 'COMPLETED').length
    }
  }

  const counts = getInquiryCounts()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm p-8">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-slate-600">Loading inquiries...</p>
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm p-8 max-w-md">
          <div className="flex flex-col items-center space-y-4 text-center">
            <XCircle className="w-12 h-12 text-red-500" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Failed to Load</h3>
              <p className="text-slate-600 mb-4">{error}</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={loadInquiries}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Manage Inquiries</h1>
                <p className="text-slate-600">Track and respond to collaboration requests</p>
              </div>
            </div>
            <Button onClick={loadInquiries}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search inquiries by company, contact, or message..."
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Status Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
              <TabsTrigger value="contacted">Contacted ({counts.contacted})</TabsTrigger>
              <TabsTrigger value="negotiating">Negotiating ({counts.negotiating})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({counts.accepted})</TabsTrigger>
              <TabsTrigger value="declined">Declined ({counts.declined})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({counts.completed})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              {filteredInquiries.length > 0 ? (
                <div className="space-y-4">
                  {filteredInquiries.map((inquiry) => (
                    <Card key={inquiry.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start space-x-4">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h3 className="font-semibold text-slate-900">{inquiry.companyName}</h3>
                                  <Badge className={inquiryService.getStatusColor(inquiry.status)}>
                                    {inquiryService.getStatusIcon(inquiry.status)} {inquiry.status}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-slate-600">
                                  <div className="flex items-center space-x-2">
                                    <User className="w-4 h-4" />
                                    <span>{inquiry.contactName}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4" />
                                    <span>{inquiry.email}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatSafeDate(inquiry.createdAt)}</span>
                                  </div>
                                  {inquiry.budget && (
                                    <div className="flex items-center space-x-2">
                                      <DollarSign className="w-4 h-4" />
                                      <span>{inquiryService.formatCurrency(inquiry.budget)} budget</span>
                                    </div>
                                  )}
                                </div>

                                <p className="text-slate-700 mb-4 line-clamp-3">{inquiry.message}</p>

                                {/* Package Details */}
                                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                                  <h4 className="font-medium text-slate-900 mb-2">Package Inquiry:</h4>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">
                                      {inquiry.packageDetails.platform} {inquiry.packageDetails.type}
                                      {inquiry.packageDetails.title && ` - ${inquiry.packageDetails.title}`}
                                    </span>
                                    <span className="font-semibold text-green-600">
                                      {inquiryService.formatCurrency(inquiry.packageDetails.price)}
                                    </span>
                                  </div>
                                </div>

                                {/* Response */}
                                {inquiry.response && (
                                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
                                    <h4 className="font-medium text-blue-900 mb-1">Your Response:</h4>
                                    <p className="text-blue-800 text-sm">{inquiry.response}</p>
                                    <p className="text-blue-600 text-xs mt-1">
                                      Responded {formatSafeDate(inquiry.respondedAt!)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInquiry(inquiry)
                                setShowDetail(true)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Details
                            </Button>
                            
                            {inquiry.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleStatusUpdate(inquiry, 'CONTACTED')}
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleStatusUpdate(inquiry, 'DECLINED')}
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Decline
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-12 text-center">
                    <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">No Inquiries Found</h3>
                    <p className="text-slate-600">
                      {searchTerm 
                        ? "No inquiries match your search criteria."
                        : selectedTab === 'all' 
                          ? "You haven't received any collaboration inquiries yet."
                          : `No inquiries with status "${selectedTab}".`
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  )
}