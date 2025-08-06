# 🔌 API Integration Guide - Frontend ↔ Backend

## 📌 Overview

This guide provides exact API endpoints and data structures for seamless integration between the React frontend and NestJS backend.

---

## 🔐 Authentication Flow

### **Login Flow**
```typescript
// Frontend: Login Component
const login = async (email: string, password: string, role: 'brand' | 'influencer') => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  })
  
  const data = await response.json()
  // { access_token, refresh_token, user, redirectTo: '/dashboard/brand' }
  
  localStorage.setItem('access_token', data.access_token)
  navigate(data.redirectTo)
}
```

### **Signup → Onboarding Flow**
```typescript
// Frontend: Signup Component
const signup = async (email: string, password: string, role: 'brand' | 'influencer') => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  })
  
  const data = await response.json()
  // { access_token, user, redirectTo: '/onboarding/brand' }
  
  localStorage.setItem('access_token', data.access_token)
  navigate(data.redirectTo)
}
```

---

## 👤 Onboarding Integration

### **Influencer Onboarding**
```typescript
// Step 1: Personal Information
const submitPersonalInfo = async (data: PersonalInfoData) => {
  await fetch('/api/onboarding/influencer/personal', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
}

// Step 2: Categories & Niches
const submitCategories = async (data: CategoriesData) => {
  await fetch('/api/onboarding/influencer/categories', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      categories: data.categories,
      niches: data.niches,
      languages: data.languages
    })
  })
}

// Step 3: Social Media Accounts
const submitSocialAccounts = async (data: SocialAccountsData) => {
  await fetch('/api/onboarding/influencer/social', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      accounts: data.accounts // [{ platform: 'instagram', username: '@user' }]
    })
  })
}

// Step 4: Content Types & Rates
const submitRates = async (data: RatesData) => {
  await fetch('/api/onboarding/influencer/rates', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      contentTypes: data.contentTypes,
      rates: data.rates // { 'instagram_post': 250, 'tiktok_video': 200 }
    })
  })
}
```

### **Brand Onboarding**
```typescript
// Step 1: Company Information
const submitCompanyInfo = async (data: CompanyInfoData) => {
  const formData = new FormData()
  formData.append('companyName', data.companyName)
  formData.append('industry', data.industry)
  formData.append('description', data.description)
  if (data.logo) formData.append('logo', data.logo)
  
  await fetch('/api/onboarding/brand/company', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  })
}

// Step 2: Marketing Goals
const submitMarketingGoals = async (data: MarketingGoalsData) => {
  await fetch('/api/onboarding/brand/goals', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      objectives: data.objectives,
      campaignTypes: data.campaignTypes,
      targetAudience: data.targetAudience
    })
  })
}

// Step 3: Budget & Preferences
const submitPreferences = async (data: PreferencesData) => {
  await fetch('/api/onboarding/brand/preferences', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      budgetRange: data.budgetRange,
      platforms: data.platforms,
      influencerTypes: data.influencerTypes
    })
  })
}
```

---

## 🏠 Dashboard Integration

### **Brand Dashboard**
```typescript
// Frontend: BrandDashboard Component
const loadDashboardData = async () => {
  const response = await fetch('/api/dashboard/brand/overview', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  const data = await response.json()
  // {
  //   campaigns: { total: 5, active: 3, completed: 2 },
  //   revenue: { total: 15000, thisMonth: 3500 },
  //   influencers: { total: 25, active: 18 },
  //   performance: { reach: '2.1M', engagement: '12.3%' }
  // }
  
  setDashboardData(data)
}
```

### **Influencer Dashboard**
```typescript
// Frontend: InfluencerDashboard Component
const loadDashboardData = async () => {
  const response = await fetch('/api/dashboard/influencer/overview', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  const data = await response.json()
  // {
  //   earnings: { total: 2500, thisMonth: 800, pending: 250 },
  //   campaigns: { active: 3, completed: 8, applications: 2 },
  //   performance: { reach: '150K', engagement: '8.4%' },
  //   recentActivities: [...]
  // }
  
  setDashboardData(data)
}
```

---

## 🔍 Discovery Integration

### **Discover Influencers**
```typescript
// Frontend: DiscoverInfluencers Component
const searchInfluencers = async (filters: DiscoveryFilters) => {
  const queryParams = new URLSearchParams({
    search: filters.search,
    minFollowers: filters.minFollowers,
    maxFollowers: filters.maxFollowers,
    niches: filters.niches.join(','),
    locations: filters.locations.join(','),
    platforms: filters.platforms.join(','),
    verified: filters.verified.toString(),
    page: page.toString(),
    limit: '12'
  })
  
  const response = await fetch(`/api/discover/influencers?${queryParams}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  const data = await response.json()
  // {
  //   influencers: [...],
  //   total: 150,
  //   page: 1,
  //   hasMore: true
  // }
  
  setInfluencers(data.influencers)
}

// Shortlist Management
const toggleShortlist = async (influencerId: string, isShortlisted: boolean) => {
  const method = isShortlisted ? 'DELETE' : 'POST'
  await fetch(`/api/shortlists/influencers/${influencerId}`, {
    method,
    headers: { 'Authorization': `Bearer ${token}` }
  })
}
```

---

## 📣 Campaign Integration

### **Campaign Detail View**
```typescript
// Frontend: CampaignDetail Component
const loadCampaignData = async (campaignId: string) => {
  const [campaign, influencers, content] = await Promise.all([
    fetch(`/api/campaigns/${campaignId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),
    
    fetch(`/api/campaigns/${campaignId}/influencers`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()),
    
    fetch(`/api/campaigns/${campaignId}/content`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
  ])
  
  setCampaign(campaign)
  setInfluencers(influencers)
  setContent(content)
}
```

### **Influencer Content & Payout View**
```typescript
// Frontend: InfluencerContentView Component
const loadInfluencerContent = async (campaignId: string, influencerId: string) => {
  const response = await fetch(`/api/campaigns/${campaignId}/influencer/${influencerId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  
  const data = await response.json()
  // {
  //   influencer: { id, name, avatar, stats... },
  //   contentSubmissions: [...],
  //   paymentSummary: { total, paid, pending, completed }
  // }
  
  setInfluencer(data.influencer)
  setContentSubmissions(data.contentSubmissions)
}

// Mark Content as Completed
const markContentCompleted = async (contentId: string) => {
  await fetch(`/api/content/${contentId}/mark-completed`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  })
}

// Process Payment
const processPayment = async (contentId: string, paymentData: PaymentData) => {
  await fetch('/api/payments/process', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      contentId,
      amount: paymentData.amount,
      paymentMethod: paymentData.method
    })
  })
}

// Bulk Payment
const processBulkPayment = async (contentIds: string[]) => {
  await fetch('/api/payments/bulk', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ contentIds })
  })
}
```

---

## 📄 Content Management Integration

### **Content Approval**
```typescript
// Frontend: ContentDetailModal Component
const approveContent = async (contentId: string, feedback?: string) => {
  await fetch(`/api/content/${contentId}/approve`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ feedback })
  })
}

const rejectContent = async (contentId: string, feedback: string) => {
  await fetch(`/api/content/${contentId}/reject`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ feedback })
  })
}

const requestRevision = async (contentId: string, feedback: string) => {
  await fetch(`/api/content/${contentId}/request-revision`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ feedback })
  })
}
```

---

## 🔔 Notifications Integration

### **Real-time Notifications**
```typescript
// Frontend: NotificationSystem Component
import { io } from 'socket.io-client'

const initializeNotifications = () => {
  // Load initial notifications
  const loadNotifications = async () => {
    const response = await fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await response.json()
    setNotifications(data.notifications)
    setUnreadCount(data.unreadCount)
  }
  
  // Setup WebSocket for real-time updates
  const socket = io('/notifications', {
    auth: { token }
  })
  
  socket.on('notification', (notification) => {
    setNotifications(prev => [notification, ...prev])
    setUnreadCount(prev => prev + 1)
  })
  
  loadNotifications()
}

// Mark as Read
const markAsRead = async (notificationId: string) => {
  await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  })
}

// Mark All as Read
const markAllAsRead = async () => {
  await fetch('/api/notifications/mark-all-read', {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` }
  })
}
```

---

## 📊 File Upload Integration

### **File Upload Service**
```typescript
// Frontend: File Upload Components
const uploadFile = async (file: File, type: 'avatar' | 'content' | 'campaign-brief') => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  
  const response = await fetch(`/api/files/upload/${type}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  })
  
  const data = await response.json()
  // { fileId, url, thumbnailUrl }
  
  return data
}

// Avatar Upload
const uploadAvatar = async (file: File) => {
  const result = await uploadFile(file, 'avatar')
  
  // Update profile with new avatar
  await fetch('/api/profile/me', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ avatarUrl: result.url })
  })
}
```

---

## 🔧 Error Handling

### **API Error Response Format**
```typescript
// Standard Error Response
{
  statusCode: 400,
  message: 'Validation failed',
  error: 'Bad Request',
  details: {
    field: 'email',
    message: 'Email is already taken'
  }
}

// Frontend Error Handling
const handleApiError = (error: any) => {
  if (error.statusCode === 401) {
    // Token expired, redirect to login
    localStorage.removeItem('access_token')
    navigate('/login')
  } else if (error.statusCode === 403) {
    // Insufficient permissions
    toast.error('Access denied')
  } else {
    // General error
    toast.error(error.message || 'Something went wrong')
  }
}
```

---

## 🚀 **Integration Checklist**

### **✅ Authentication**
- [ ] Login/Signup integration
- [ ] Token management
- [ ] Role-based redirects

### **✅ Onboarding** 
- [ ] Multi-step form data submission
- [ ] Progress tracking
- [ ] File upload integration

### **✅ Dashboard**
- [ ] Real-time data loading
- [ ] Role-specific endpoints
- [ ] Performance metrics

### **✅ Discovery**
- [ ] Advanced filtering
- [ ] Pagination
- [ ] Shortlist management

### **✅ Campaigns**
- [ ] CRUD operations
- [ ] Participant management
- [ ] Content tracking

### **✅ Payments**
- [ ] Payment processing
- [ ] Status tracking
- [ ] Bulk operations

### **✅ Notifications**
- [ ] Real-time WebSocket
- [ ] Notification management
- [ ] Push notifications

### **✅ File Management**
- [ ] Multi-type uploads
- [ ] Progress tracking
- [ ] CDN integration

**🎯 Status: Ready for seamless frontend-backend integration!**
