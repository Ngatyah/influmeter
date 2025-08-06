# 🧠 Influmeter Backend Architecture (NestJS)

## 📌 Overview

Influmeter is a modern influencer performance and campaign analytics platform. The backend is built on **NestJS** and is responsible for handling user authentication, onboarding, profile management, influencer-brand interactions, campaign tracking, content approvals, payment processing, notifications, and AI-driven suggestions.

---

## 🏗 Tech Stack

- **Framework**: NestJS (Node.js)
- **ORM**: TypeORM or Prisma (PostgreSQL)
- **Database**: PostgreSQL
- **Cache**: Redis (for sessions, rate limits, notifications)
- **File Storage**: Cloudinary / AWS S3 (profile images, content uploads)
- **Auth**: JWT + OAuth2 (for social platform auth)
- **Queue**: BullMQ + Redis (background jobs, payments)
- **Payments**: Stripe, M-Pesa, PayPal integrations
- **Notifications**: WebSocket (Socket.io) + Push notifications
- **Email**: SendGrid / AWS SES
- **Logging**: Winston + LogRocket integration
- **AI Suggestions**: GPT-based APIs (OpenAI or Claude)
- **Monitoring**: Sentry, Prometheus + Grafana

---

## 🧩 Core Modules

### 1. **Auth Module**
- JWT-based login for Influencers, Brands, Admin
- OAuth2 login (Google/Facebook/Instagram) for Influencers
- Password-based login for Brands
- Token refresh & expiration handling
- Password reset functionality
- Email verification

### 2. **Users Module**
- `User` entity with polymorphic roles:
  - Influencer
  - Brand
  - Admin
- Profile setup, editing, verification
- Public profile view endpoint (for Discover)
- Profile image upload and management
- Account settings and preferences

### 3. **Onboarding Module** ⭐ **NEW**
- **Influencer Onboarding API**:
  - Step 1: Personal Information (`POST /onboarding/influencer/personal`)
  - Step 2: Categories & Niches (`POST /onboarding/influencer/categories`)
  - Step 3: Social Media Accounts (`POST /onboarding/influencer/social`)
  - Step 4: Content Types & Rates (`POST /onboarding/influencer/rates`)
- **Brand Onboarding API**:
  - Step 1: Company Information (`POST /onboarding/brand/company`)
  - Step 2: Marketing Goals (`POST /onboarding/brand/goals`)
  - Step 3: Budget & Preferences (`POST /onboarding/brand/preferences`)
- **Onboarding Progress Tracking**
- **Skip/Resume Onboarding Logic**

### 4. **Profile Management Module** ⭐ **NEW**
- **Profile Settings API**:
  - Update bio, social links, contact info
  - Change email/password
  - Profile picture upload
- **Privacy Settings**:
  - Public/private profile toggle
  - Notification preferences
- **Account Verification**:
  - Social media account verification
  - Identity verification for brands
- **Profile Analytics**:
  - Profile views, engagement metrics

### 5. **Campaigns Module**
- Brand creates campaigns with:
  - Name, Budget, Duration, Objective
  - Target influencers (filters or direct invite)
  - Content requirements and briefs
- Campaign approval lifecycle:
  - Draft → Submitted → Approved → Active → Completed
- Campaign discovery for influencers
- Application process management
- Campaign metrics and analytics

### 6. **Content Management Module** ⭐ **ENHANCED**
- **Content Submission API**:
  - File upload (images/videos)
  - Caption and hashtag management
  - Platform targeting
- **Content Approval Workflow**:
  - Pending → Approved → Completed → Paid
  - Approval/rejection with feedback
  - Content revision requests
- **Content Performance Tracking**:
  - Individual content metrics
  - Engagement analytics per piece
- **Content-Payment Association**:
  - Link content to payment amounts
  - Track payment status per content

### 7. **Payments & Payouts Module** ⭐ **NEW - CRITICAL**
- **Payment Processing**:
  - Integration with Stripe, M-Pesa, PayPal
  - Content-level payment amounts
  - Bulk payment processing
- **Payout Management**:
  - Individual content payouts
  - Bulk "Pay All Completed" functionality
  - Payment method management
- **Financial Tracking**:
  - Payment status tracking (Pending → Completed → Paid)
  - Earnings analytics for influencers
  - Payment history and reporting
- **Platform Fees**:
  - Automatic fee calculation (5% platform fee)
  - Fee reporting and analytics

### 8. **Notifications Module** ⭐ **NEW - CRITICAL**
- **Real-time Notifications**:
  - WebSocket integration for live updates
  - Push notifications (mobile)
  - Email notifications
- **Notification Types**:
  - Campaign invites
  - Content approval status
  - Payment updates
  - System announcements
  - Collaboration requests
- **Notification Management**:
  - Mark as read/unread
  - Delete notifications
  - Notification preferences
- **Role-based Notifications**:
  - Different notification types for brands vs influencers

### 9. **Influencer Module**
- Influencer dashboard metrics (followers, reach, engagement)
- Auto-sync data from social platforms
- Earnings tracking and payout history
- Access to brand campaigns (if qualified)
- Application & rebooking logic
- Performance analytics

### 10. **Social Integration Module**
- OAuth2 Authentication (YouTube, Instagram, TikTok)
- Fetch metrics via APIs:
  - Followers count
  - Reach & impressions
  - Engagement (likes, comments, views)
- Periodic sync via background jobs (BullMQ)
- Platform verification status

### 11. **Analytics Module** ⭐ **ENHANCED**
- **Campaign Analytics**:
  - Performance metrics per campaign
  - ROI calculations
  - Influencer performance comparison
- **Content Analytics**:
  - Individual content performance
  - Platform-specific metrics
  - Engagement tracking over time
- **Financial Analytics**:
  - Payment analytics
  - Earnings reports
  - Platform revenue tracking
- **User Analytics**:
  - Dashboard metrics for brands/influencers
  - Profile performance analytics

### 12. **Discovery Module** ⭐ **NEW**
- **Influencer Discovery API**:
  - Advanced search and filtering
  - Location-based filtering
  - Niche and category filtering
  - Follower count ranges
  - Engagement rate filtering
- **Shortlisting Functionality**:
  - Save/unsave influencers
  - Shortlist management
- **Recommendation Engine**:
  - AI-powered influencer suggestions
  - Campaign matching algorithms

### 13. **File Management Module** ⭐ **NEW**
- **File Upload Service**:
  - Profile pictures
  - Content uploads (images/videos)
  - Company logos
  - Campaign briefs
- **File Processing**:
  - Image resizing and optimization
  - Video thumbnail generation
  - File type validation
- **CDN Integration**:
  - Fast file delivery
  - Global content distribution

### 14. **Referral & Conversion Tracking Module**
- Each influencer gets a:
  - Unique referral link (e.g., `influmeter.com/go/murugi`)
  - Unique code (e.g., `MURUGI25`)
- Brands embed code input field or use UTM parameters
- Collect:
  - Click-through data
  - Sales/conversions via webhook
  - Attribution percentage per influencer

### 15. **AI Suggestion Engine**
- GPT-generated campaign reports
- Performance insights and recommendations
- Automated campaign optimization suggestions
- Content performance analysis

### 16. **Admin Module**
- Platform management dashboard
- User moderation and management
- Campaign oversight
- Content moderation
- Financial reporting and analytics
- System configuration

---

## 📡 Complete API Endpoints Structure

### **Authentication & Onboarding**
```typescript
// Authentication
POST   /auth/login
POST   /auth/signup
POST   /auth/oauth/:provider (google, facebook, instagram)
POST   /auth/refresh-token
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/verify-email

// Influencer Onboarding
POST   /onboarding/influencer/personal
POST   /onboarding/influencer/categories
POST   /onboarding/influencer/social
POST   /onboarding/influencer/rates
GET    /onboarding/influencer/progress
PUT    /onboarding/influencer/skip/:step

// Brand Onboarding
POST   /onboarding/brand/company
POST   /onboarding/brand/goals
POST   /onboarding/brand/preferences
GET    /onboarding/brand/progress
PUT    /onboarding/brand/skip/:step
```

### **Profile Management**
```typescript
// User Profile
GET    /profile/me
PUT    /profile/me
POST   /profile/avatar
DELETE /profile/avatar
GET    /profile/settings
PUT    /profile/settings
POST   /profile/verify-social/:platform

// Public Profiles
GET    /profiles/influencer/:id
GET    /profiles/influencer/:id/portfolio
GET    /profiles/influencer/:id/reviews
```

### **Dashboard APIs**
```typescript
// Brand Dashboard
GET    /dashboard/brand/overview
GET    /dashboard/brand/campaigns
GET    /dashboard/brand/influencers
GET    /dashboard/brand/analytics

// Influencer Dashboard
GET    /dashboard/influencer/overview
GET    /dashboard/influencer/campaigns
GET    /dashboard/influencer/earnings
GET    /dashboard/influencer/analytics
```

### **Campaign Management**
```typescript
// Campaign CRUD
GET    /campaigns
POST   /campaigns
GET    /campaigns/:id
PUT    /campaigns/:id
DELETE /campaigns/:id
POST   /campaigns/:id/publish
PUT    /campaigns/:id/pause
PUT    /campaigns/:id/resume

// Campaign Discovery & Applications
GET    /campaigns/browse
POST   /campaigns/:id/apply
GET    /campaigns/:id/applications
PUT    /campaigns/:id/applications/:applicationId/status

// Campaign Participants
GET    /campaigns/:id/influencers
POST   /campaigns/:id/influencers/invite
GET    /campaigns/:campaignId/influencer/:influencerId
PUT    /campaigns/:campaignId/influencer/:influencerId/status
```

### **Content Management**
```typescript
// Content Submission
POST   /content/submit
GET    /content/:id
PUT    /content/:id
DELETE /content/:id

// Content Approval Workflow
PUT    /content/:id/approve
PUT    /content/:id/reject
PUT    /content/:id/request-revision
PUT    /content/:id/mark-completed

// Campaign Content
GET    /campaigns/:id/content
GET    /campaigns/:id/content/pending
GET    /campaigns/:id/content/approved
```

### **Payments & Payouts**
```typescript
// Payment Processing
POST   /payments/process
POST   /payments/bulk
POST   /payments/content/:contentId
GET    /payments/history
GET    /payments/:id/status

// Earnings & Payouts
GET    /earnings
GET    /earnings/history
POST   /earnings/withdraw
GET    /payouts
GET    /payouts/:id

// Payment Methods
GET    /payment-methods
POST   /payment-methods
PUT    /payment-methods/:id
DELETE /payment-methods/:id
```

### **Notifications**
```typescript
// Notification Management
GET    /notifications
GET    /notifications/unread-count
PUT    /notifications/:id/read
PUT    /notifications/mark-all-read
DELETE /notifications/:id
POST   /notifications/preferences

// Real-time WebSocket Events
WS     /notifications/live
```

### **Discovery & Search**
```typescript
// Influencer Discovery
GET    /discover/influencers
POST   /discover/influencers/search
GET    /discover/influencers/filters
GET    /discover/influencers/recommendations

// Shortlisting
GET    /shortlists
POST   /shortlists/influencers/:id
DELETE /shortlists/influencers/:id
```

### **Analytics**
```typescript
// Campaign Analytics
GET    /analytics/campaigns/:id
GET    /analytics/campaigns/:id/performance
GET    /analytics/campaigns/:id/roi

// Content Analytics
GET    /analytics/content/:id
GET    /analytics/content/:id/engagement

// Platform Analytics
GET    /analytics/platform/overview
GET    /analytics/platform/revenue
```

### **File Management**
```typescript
// File Upload
POST   /files/upload
POST   /files/upload/avatar
POST   /files/upload/content
POST   /files/upload/campaign-brief
GET    /files/:id
DELETE /files/:id
```

### **Admin APIs**
```typescript
// User Management
GET    /admin/users
GET    /admin/users/:id
PUT    /admin/users/:id/status
DELETE /admin/users/:id

// Platform Management
GET    /admin/campaigns
GET    /admin/content/moderation
PUT    /admin/content/:id/moderate
GET    /admin/analytics/platform
```

---

## 🗄️ Complete Database Schema

### **Core User Tables**
```sql
-- Users
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR,
  role ENUM('influencer', 'brand', 'admin'),
  email_verified BOOLEAN DEFAULT false,
  status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User Profiles
user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  first_name VARCHAR,
  last_name VARCHAR,
  bio TEXT,
  avatar_url VARCHAR,
  phone VARCHAR,
  location VARCHAR,
  website VARCHAR,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Onboarding Tables**
```sql
-- Onboarding Progress
onboarding_progress (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  current_step INTEGER DEFAULT 1,
  completed_steps JSONB DEFAULT '[]',
  is_completed BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Influencer Details
influencer_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  categories TEXT[] DEFAULT '{}',
  niches TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  content_types TEXT[] DEFAULT '{}',
  rates JSONB DEFAULT '{}',
  demographics JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Brand Details
brand_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  company_name VARCHAR NOT NULL,
  industry VARCHAR,
  company_size ENUM('startup', 'small', 'medium', 'large', 'enterprise'),
  logo_url VARCHAR,
  description TEXT,
  marketing_goals TEXT[] DEFAULT '{}',
  budget_range VARCHAR,
  target_audience JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Campaign Tables**
```sql
-- Campaigns
campaigns (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES users(id),
  title VARCHAR NOT NULL,
  description TEXT,
  objective VARCHAR,
  budget DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  status ENUM('draft', 'active', 'paused', 'completed', 'cancelled') DEFAULT 'draft',
  requirements JSONB DEFAULT '{}',
  target_criteria JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaign Applications
campaign_applications (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  influencer_id UUID REFERENCES users(id),
  status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
  application_data JSONB DEFAULT '{}',
  applied_at TIMESTAMP DEFAULT NOW(),
  responded_at TIMESTAMP,
  UNIQUE(campaign_id, influencer_id)
);

-- Campaign Participants
campaign_participants (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  influencer_id UUID REFERENCES users(id),
  status ENUM('active', 'completed', 'removed') DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  UNIQUE(campaign_id, influencer_id)
);
```

### **Content Tables**
```sql
-- Content Submissions
content_submissions (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  influencer_id UUID REFERENCES users(id),
  title VARCHAR,
  description TEXT,
  caption TEXT,
  hashtags TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  content_type ENUM('image', 'video', 'story', 'reel', 'post'),
  status ENUM('pending', 'approved', 'rejected', 'completed', 'paid') DEFAULT 'pending',
  feedback TEXT,
  amount DECIMAL(10,2),
  submitted_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  completed_at TIMESTAMP,
  paid_at TIMESTAMP
);

-- Content Files
content_files (
  id UUID PRIMARY KEY,
  content_id UUID REFERENCES content_submissions(id),
  file_url VARCHAR NOT NULL,
  file_type VARCHAR NOT NULL,
  file_size BIGINT,
  thumbnail_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Content Performance
content_performance (
  content_id UUID PRIMARY KEY REFERENCES content_submissions(id),
  views BIGINT DEFAULT 0,
  likes BIGINT DEFAULT 0,
  comments BIGINT DEFAULT 0,
  shares BIGINT DEFAULT 0,
  saves BIGINT DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  last_updated TIMESTAMP DEFAULT NOW()
);
```

### **Payment Tables**
```sql
-- Payments
payments (
  id UUID PRIMARY KEY,
  content_id UUID REFERENCES content_submissions(id),
  influencer_id UUID REFERENCES users(id),
  brand_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR,
  transaction_id VARCHAR,
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Payment Methods
payment_methods (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type ENUM('stripe', 'mpesa', 'paypal', 'bank_transfer'),
  details JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Earnings
user_earnings (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  total_earned DECIMAL(10,2) DEFAULT 0,
  total_paid DECIMAL(10,2) DEFAULT 0,
  pending_amount DECIMAL(10,2) DEFAULT 0,
  last_payout_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Notification Tables**
```sql
-- Notifications
notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notification Preferences
notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  notification_types JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Analytics Tables**
```sql
-- User Analytics
user_analytics (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  profile_views BIGINT DEFAULT 0,
  total_campaigns INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  avg_engagement_rate DECIMAL(5,2),
  last_calculated TIMESTAMP DEFAULT NOW()
);

-- Campaign Analytics
campaign_analytics (
  campaign_id UUID PRIMARY KEY REFERENCES campaigns(id),
  total_reach BIGINT DEFAULT 0,
  total_impressions BIGINT DEFAULT 0,
  total_engagement BIGINT DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  roi DECIMAL(5,2),
  cost_per_engagement DECIMAL(10,2),
  last_calculated TIMESTAMP DEFAULT NOW()
);
```

### **Discovery & Social Tables**
```sql
-- Shortlists
shortlists (
  id UUID PRIMARY KEY,
  brand_id UUID REFERENCES users(id),
  influencer_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(brand_id, influencer_id)
);

-- Social Media Accounts
social_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  platform VARCHAR NOT NULL,
  platform_user_id VARCHAR,
  username VARCHAR,
  access_token TEXT,
  refresh_token TEXT,
  followers_count BIGINT DEFAULT 0,
  following_count BIGINT DEFAULT 0,
  posts_count BIGINT DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  is_verified BOOLEAN DEFAULT false,
  is_connected BOOLEAN DEFAULT true,
  last_synced TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔁 Background Jobs & Queues

### **Payment Queue**
```typescript
// Payment processing jobs
process-payment-job
retry-failed-payment-job
calculate-platform-fees-job
generate-payment-report-job
```

### **Notification Queue**
```typescript
// Notification delivery jobs
send-email-notification-job
send-push-notification-job
send-sms-notification-job
cleanup-old-notifications-job
```

### **Analytics Queue**
```typescript
// Analytics calculation jobs
calculate-user-analytics-job
calculate-campaign-analytics-job
calculate-content-performance-job
generate-daily-reports-job
```

### **Social Media Queue**
```typescript
// Social platform sync jobs
sync-instagram-metrics-job
sync-tiktok-metrics-job
sync-youtube-metrics-job
verify-social-accounts-job
```

---

## 🎯 Implementation Roadmap

### **Phase 1: Foundation (Weeks 1-2)**
1. ✅ Project Setup & Core Architecture
2. ✅ Auth Module (JWT + OAuth2)
3. ✅ Users Module (Basic CRUD)
4. ✅ Database Schema Setup
5. ✅ File Upload Service

### **Phase 2: Core Features (Weeks 3-4)**
1. ✅ Onboarding Module (Both roles)
2. ✅ Profile Management Module
3. ✅ Campaign Module (Basic CRUD)
4. ✅ Content Management Module
5. ✅ Discovery Module

### **Phase 3: Advanced Features (Weeks 5-6)**
1. 🚧 Payments & Payouts Module
2. 🚧 Notifications Module (Real-time)
3. 🚧 Analytics Module
4. 🚧 Social Integration Module

### **Phase 4: Optimization (Weeks 7-8)**
1. ⏳ AI Suggestion Engine
2. ⏳ Admin Module
3. ⏳ Performance Optimization
4. ⏳ Testing & Documentation

---

## 🔌 Frontend Integration Points

### **Authentication Flow**
```typescript
// Frontend → Backend
POST /auth/login → JWT Token
POST /auth/signup → User Created + Redirect to Onboarding
```

### **Onboarding Flow**
```typescript
// Influencer Onboarding
Step 1: POST /onboarding/influencer/personal
Step 2: POST /onboarding/influencer/categories  
Step 3: POST /onboarding/influencer/social
Step 4: POST /onboarding/influencer/rates

// Brand Onboarding
Step 1: POST /onboarding/brand/company
Step 2: POST /onboarding/brand/goals
Step 3: POST /onboarding/brand/preferences
```

### **Dashboard Data**
```typescript
// Brand Dashboard
GET /dashboard/brand/overview → Campaign stats, revenue, influencer metrics
GET /campaigns → Campaign list for "Campaigns" section

// Influencer Dashboard  
GET /dashboard/influencer/overview → Earnings, active campaigns, performance
```

### **Discovery Integration**
```typescript
// Discover Influencers Page
GET /discover/influencers?search=&niches=&location= → Filtered influencer list
POST /shortlists/influencers/:id → Add to shortlist
```

### **Campaign Management**
```typescript
// Campaign Detail Page
GET /campaigns/:id → Campaign overview data
GET /campaigns/:id/influencers → Participating influencers
GET /campaigns/:campaignId/influencer/:influencerId → Individual influencer content & payments
```

### **Payment Integration**
```typescript
// Payment Flow
PUT /content/:id/mark-completed → Mark content as completed
POST /payments/process → Process individual payment
POST /payments/bulk → Process bulk payments
```

### **Notifications Integration**
```typescript
// Real-time Notifications
GET /notifications → Initial notification list
WS /notifications/live → Real-time updates
PUT /notifications/:id/read → Mark as read
```

---

## 🚀 **Status: Ready for Seamless Frontend Integration**

**✅ Complete API Coverage**: All frontend features have corresponding backend APIs  
**✅ Database Schema**: Comprehensive data model for all platform features  
**✅ Real-time Support**: WebSocket integration for notifications  
**✅ Payment Processing**: Full payout system with multiple payment methods  
**✅ File Management**: Complete file upload and processing system  
**✅ Analytics**: Comprehensive analytics for all user types  

**🎯 Next Steps**: Begin Phase 1 implementation with NestJS project setup and core modules.