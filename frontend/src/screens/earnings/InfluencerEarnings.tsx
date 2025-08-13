import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatSafeDate } from '../../utils/dateUtils'
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Filter,
  Calendar,
  CreditCard,
  Smartphone,
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'

interface Earning {
  id: string
  campaign: {
    id: string
    title: string
    brand: string
  }
  amount: number
  status: 'pending' | 'approved' | 'paid' | 'rejected'
  dateEarned: string
  datePaid?: string
  description: string
  contentType: string
}

interface Payout {
  id: string
  amount: number
  method: 'mpesa' | 'bank' | 'stripe'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  requestedAt: string
  processedAt?: string
  transactionId?: string
  fee: number
}

export default function InfluencerEarnings() {
  const navigate = useNavigate()
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawMethod, setWithdrawMethod] = useState<'mpesa' | 'bank'>('mpesa')

  // Mock data - replace with API calls
  const earningsData = {
    totalEarnings: 2850.00,
    availableBalance: 1250.00,
    pendingEarnings: 800.00,
    totalPaid: 800.00,
    thisMonthEarnings: 650.00,
    lastMonthEarnings: 450.00
  }

  const recentEarnings: Earning[] = [
    {
      id: '1',
      campaign: {
        id: '1',
        title: 'Summer Skincare Collection',
        brand: 'NIVEA Kenya'
      },
      amount: 350.00,
      status: 'paid',
      dateEarned: '2024-04-20',
      datePaid: '2024-04-25',
      description: 'Instagram Reel + Stories',
      contentType: 'Social Media Post'
    },
    {
      id: '2',
      campaign: {
        id: '2',
        title: 'Tech Review Series',
        brand: 'TechHub Africa'
      },
      amount: 250.00,
      status: 'approved',
      dateEarned: '2024-04-18',
      description: 'YouTube Review Video',
      contentType: 'Video Content'
    },
    {
      id: '3',
      campaign: {
        id: '3',
        title: 'Fitness Challenge',
        brand: 'FitLife Africa'
      },
      amount: 500.00,
      status: 'pending',
      dateEarned: '2024-04-15',
      description: 'Campaign completion bonus',
      contentType: 'Campaign Bonus'
    }
  ]

  const payoutHistory: Payout[] = [
    {
      id: '1',
      amount: 450.00,
      method: 'mpesa',
      status: 'completed',
      requestedAt: '2024-04-10',
      processedAt: '2024-04-11',
      transactionId: 'MPX2024041100123',
      fee: 5.00
    },
    {
      id: '2',
      amount: 350.00,
      method: 'bank',
      status: 'completed',
      requestedAt: '2024-03-25',
      processedAt: '2024-03-27',
      transactionId: 'BNK2024032700456',
      fee: 10.00
    },
    {
      id: '3',
      amount: 200.00,
      method: 'mpesa',
      status: 'processing',
      requestedAt: '2024-04-22',
      fee: 5.00
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed': return 'bg-green-100 text-green-800'
      case 'approved':
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'approved':
      case 'processing': return <Clock className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'rejected':
      case 'failed': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const handleWithdraw = () => {
    // Simulate API call
    console.log('Withdrawal request:', { amount: withdrawAmount, method: withdrawMethod })
    setShowWithdrawModal(false)
    setWithdrawAmount('')
    // Show success notification
  }

  const canWithdraw = earningsData.availableBalance >= 100 // Minimum withdrawal amount

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
              <h1 className="text-2xl font-semibold text-slate-900">Earnings & Payments</h1>
              <p className="text-slate-600">Track your earnings and manage withdrawals</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button 
              onClick={() => setShowWithdrawModal(true)}
              disabled={!canWithdraw}
              className="bg-green-500 hover:bg-green-600"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Withdraw Funds
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${earningsData.totalEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Available Balance</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${earningsData.availableBalance.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Pending Earnings</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    ${earningsData.pendingEarnings.toFixed(2)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">This Month</p>
                  <p className="text-2xl font-bold text-slate-900">
                    ${earningsData.thisMonthEarnings.toFixed(2)}
                  </p>
                  <div className="flex items-center text-sm text-green-600 mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +{(((earningsData.thisMonthEarnings - earningsData.lastMonthEarnings) / earningsData.lastMonthEarnings) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Earnings History</TabsTrigger>
            <TabsTrigger value="payouts">Payout History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEarnings.map((earning) => (
                    <div 
                      key={earning.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {earning.campaign.brand.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{earning.campaign.title}</h3>
                          <p className="text-sm text-slate-600">{earning.campaign.brand}</p>
                          <p className="text-xs text-slate-500">{earning.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-green-600">${earning.amount.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">
                            {formatSafeDate(earning.dateEarned)}
                          </p>
                        </div>
                        
                        <Badge className={`${getStatusColor(earning.status)} flex items-center space-x-1`}>
                          {getStatusIcon(earning.status)}
                          <span className="capitalize">{earning.status}</span>
                        </Badge>
                        
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="mt-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payoutHistory.map((payout) => (
                    <div 
                      key={payout.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                          {payout.method === 'mpesa' ? (
                            <Smartphone className="w-6 h-6 text-green-600" />
                          ) : (
                            <CreditCard className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-slate-900">
                              {payout.method === 'mpesa' ? 'M-Pesa' : 'Bank Transfer'}
                            </h3>
                            {payout.transactionId && (
                              <Button variant="ghost" size="sm" className="h-auto p-0 text-blue-600">
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                          <p className="text-sm text-slate-600">
                            Requested {formatSafeDate(payout.requestedAt)}
                          </p>
                          {payout.transactionId && (
                            <p className="text-xs text-slate-500 font-mono">{payout.transactionId}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-bold text-slate-900">${payout.amount.toFixed(2)}</p>
                          <p className="text-xs text-slate-500">Fee: ${payout.fee.toFixed(2)}</p>
                        </div>
                        
                        <Badge className={`${getStatusColor(payout.status)} flex items-center space-x-1`}>
                          {getStatusIcon(payout.status)}
                          <span className="capitalize">{payout.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Earnings by Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-slate-500">
                    <p>Earnings chart would go here</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Earnings by Campaign Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Social Media Posts</span>
                      <span className="font-semibold">$1,200</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Video Content</span>
                      <span className="font-semibold">$800</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Campaign Bonuses</span>
                      <span className="font-semibold">$500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Reviews</span>
                      <span className="font-semibold">$350</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          availableBalance={earningsData.availableBalance}
          onClose={() => setShowWithdrawModal(false)}
          onWithdraw={handleWithdraw}
          withdrawAmount={withdrawAmount}
          setWithdrawAmount={setWithdrawAmount}
          withdrawMethod={withdrawMethod}
          setWithdrawMethod={setWithdrawMethod}
        />
      )}
    </div>
  )
}

function WithdrawModal({ 
  availableBalance, 
  onClose, 
  onWithdraw, 
  withdrawAmount, 
  setWithdrawAmount,
  withdrawMethod,
  setWithdrawMethod
}: {
  availableBalance: number
  onClose: () => void
  onWithdraw: () => void
  withdrawAmount: string
  setWithdrawAmount: (amount: string) => void
  withdrawMethod: 'mpesa' | 'bank'
  setWithdrawMethod: (method: 'mpesa' | 'bank') => void
}) {
  const amount = parseFloat(withdrawAmount) || 0
  const fee = withdrawMethod === 'mpesa' ? 5 : 10
  const netAmount = amount - fee

  const isValidAmount = amount >= 100 && amount <= availableBalance

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Withdraw Funds</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Available Balance: ${availableBalance.toFixed(2)}
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="100"
                max={availableBalance}
              />
              <p className="text-xs text-slate-500 mt-1">Minimum withdrawal: $100</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Withdrawal Method
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setWithdrawMethod('mpesa')}
                  className={`p-3 border rounded-lg flex items-center space-x-2 ${
                    withdrawMethod === 'mpesa' 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-slate-200'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-sm">M-Pesa</p>
                    <p className="text-xs text-slate-500">Fee: $5</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setWithdrawMethod('bank')}
                  className={`p-3 border rounded-lg flex items-center space-x-2 ${
                    withdrawMethod === 'bank' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-sm">Bank</p>
                    <p className="text-xs text-slate-500">Fee: $10</p>
                  </div>
                </button>
              </div>
            </div>

            {amount > 0 && (
              <div className="p-3 bg-slate-50 rounded-lg space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Withdrawal Amount:</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Processing Fee:</span>
                  <span>-${fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>You'll Receive:</span>
                  <span>${netAmount.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 mt-6">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={onWithdraw}
              disabled={!isValidAmount}
              className="flex-1"
            >
              Withdraw
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
