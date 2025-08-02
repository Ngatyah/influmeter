# FRONTEND_SCREENS_GUIDE.md

## 🧭 Overview

This document outlines all frontend screens required for the Influmeter platform for both **Brands** and **Influencers**. It includes descriptions, components, API dependencies, user roles, and design considerations.

---

## 🛂 1. Authentication Screens

### 🔐 1.1 Login / Sign Up
- **Status:** ✅ Implemented
- **Routes:** `/login`, `/signup`
- **Roles:** Brand, Influencer
- **Components:**
  - Email/password fields
  - Google/Apple login
  - Role selection (Brand/Influencer)
- **Data Requirements:**
  - `/auth/login`, `/auth/signup`, `/auth/oauth`
- **Actions:**
  - Input validation
  - Role-based redirection
- **Flow:**
  - **Login Screen**: Existing users → Direct to dashboard (`/dashboard/{role}`)
  - **Signup Screen**: New users → Onboarding flow (`/onboarding/{role}`)
  - Automatic role-based redirection
  - Session management and persistence
- **Notes:** Support magic link login (optional)

---

## 👤 2. Onboarding & Profile Setup

### 🎯 2.1 Influencer Onboarding
- **Status:** ✅ Implemented
- **Route:** `/onboarding/influencer`
- **Components:**
  - 4-step stepper UI with progress bar
  - Personal information form with validation
  - Category and niche selection
  - Social media account linking with OAuth simulation
  - Content preferences and rate setting
- **Steps:**
  1. Personal Information (name, bio, location, demographics)
  2. Categories & Niches (expertise areas, languages)
  3. Social Media Accounts (Instagram, TikTok, YouTube, Twitter)
  4. Content Types & Rates (preferences, starting rates)
- **Data:**
  - `/influencer/onboarding`
  - `/social/connect`
- **Actions:**
  - Progressive form completion
  - Social media OAuth flows (simulated)
  - Skip option for quick access
  - Form validation and data persistence

### 🏢 2.2 Brand Onboarding
- **Status:** ✅ Implemented
- **Route:** `/onboarding/brand`
- **Components:**
  - 3-step stepper UI with progress bar
  - Company information form with logo upload
  - Marketing goals and target audience setup
  - Budget and collaboration preferences
- **Steps:**
  1. Company Information (name, industry, logo, description)
  2. Marketing Goals (objectives, campaign types, target audience)
  3. Budget & Preferences (budget range, platforms, influencer types)
- **Data:**
  - `/brand/onboarding`
- **Actions:**
  - File upload for company logo
  - Multi-select preference setting
  - Skip option for quick access
  - Comprehensive brand profile creation

---

## 🏠 3. Dashboards

### 📊 3.1 Influencer Dashboard
- **Status:** ✅ Implemented
- **Widgets:**
  - Active campaigns
  - Approved content
  - Earnings tracker
  - Performance metrics (engagement rate, CTR)
- **Data:**
  - `/influencer/overview`
  - `/campaigns/active`
- **Notes:** Show alerts for pending content approvals.

### 📈 3.2 Brand Dashboard
- **Status:** ✅ Implemented
- **Widgets:**
  - Campaign performance
  - Influencer stats
  - Top-performing creatives
- **Data:**
  - `/brand/overview`
  - `/campaigns/stats`
- **Notes:** CTA for “Launch New Campaign”

---

## 📣 4. Campaign Screens

### 🆕 4.1 Create Campaign (Multi-Step)
- **Status:** ✅ Implemented
- **Route:** `/campaigns/create`
- **Steps:**
  1. Campaign Details (title, objective)
  2. Target Audience
  3. Budget & Timeline
  4. Content Brief Upload
  5. Influencer Requirements
- **Data:**
  - `/campaigns/create`
- **Actions:**
  - Save as draft
  - Launch campaign

### 📋 4.2 My Campaigns (Brand)
- **Status:** ✅ Implemented
- **Route:** `/campaigns`
- **Components:**
  - Campaign overview cards with status
  - Search and filter functionality
  - Status-based tabs (active, draft, paused, completed)
  - Performance metrics per campaign
  - Quick actions (view, edit, pause/resume)
- **Data:**
  - `/campaigns/mine`
- **Actions:**
  - View campaign details
  - Create new campaign
  - Pause/resume campaigns
  - Filter and search
- **Notes:** Complete campaign management interface

### 📑 4.3 Campaign Detail View (Brand)
- **Status:** ✅ Implemented
- **Route:** `/campaigns/:id`
- **Tabs:**
  - Overview
  - Influencers Participating
  - Content Approvals
  - Metrics
- **Data:**
  - `/campaigns/:id`
  - `/campaigns/:id/content`
  - `/campaigns/:id/influencers`

---

## 🔍 5. Discover / Marketplace

### 🔭 5.1 Discover Influencers (Brand)
- **Status:** ✅ Implemented
- **Components:**
  - Search bar, filters (followers, region, niche)
  - Influencer cards (bio + metrics)
- **Data:**
  - `/influencers/discover`
  - `/influencers/:id`
- **Actions:**
  - Save to shortlists
  - Invite to campaign
- **Note:** Must support pagination or infinite scroll

### 👤 5.2 Influencer Public Profile
- **Status:** ✅ Implemented
- **Route:** `/influencer/:id`
- **Components:**
  - Cover image and profile picture
  - Bio and social media links
  - Platform-specific statistics
  - Portfolio/recent work showcase
  - Package pricing and rates
  - Reviews and testimonials
  - Contact and collaboration CTAs
- **Data:**
  - `/influencers/:id/profile`
  - `/influencers/:id/portfolio`
  - `/influencers/:id/reviews`
- **Actions:**
  - Contact influencer
  - View portfolio items
  - Request collaboration quote
  - Share profile
- **Notes:** Public marketing page for influencers, accessible without authentication

---

## 🧑‍💻 6. Campaign Participation (Influencer)

### 📥 6.1 Browse Open Campaigns
- **Status:** ✅ Implemented
- **Route:** `/campaigns/browse`
- **List View:** Campaign cards (brief, payout, requirements)
- **Components:**
  - Search and filter functionality
  - Campaign cards with key information
  - Pagination or infinite scroll
  - Advanced filtering (platform, niche, payout range)
- **Data:**
  - `/campaigns/open`
- **Actions:**
  - View campaign details
  - Apply to campaigns
  - Bookmark campaigns
  - Filter by criteria

### 📤 6.2 Submit Content
- **Status:** ✅ Implemented
- **Route:** `/campaigns/:campaignId/submit`
- **Fields:**
  - Caption
  - File uploader
  - Platform tags
- **Data:**
  - `/content/submit`

### 📋 6.3 Campaign Detail View (Influencer)
- **Status:** ✅ Implemented
- **Route:** `/campaigns/:id/details`
- **Data:**
  - `/campaigns/:id`
  - `/campaigns/:id/content`
  - `/campaigns/:id/influencers`

### 📝 6.4 Campaign Application
- **Status:** ✅ Implemented
- **Route:** `/campaigns/:id/apply`
- **Fields:**
  - Personal details
  - Platform metrics
  - Proposed content examples
- **Data:**
  - `/campaigns/:id`
  - `/campaigns/:id/apply`

---

## 📄 7. Content Approvals (Brand)

### 🗂 7.1 Approve Content
- **Status:** ✅ Implemented
- **View:** Pending submissions (influencer, post preview)
- **Actions:**
  - Approve / Request edits / Reject
- **Data:**
  - `/content/pending`
  - `/content/approve`
- **Notes:**
  - Send notification to influencer on status change

---

## 🧾 8. Earnings & Payments

### 💰 8.1 Influencer Earnings
- **Status:** ✅ Implemented
- **Sections:**
  - Total earnings
  - Payment history
  - Withdraw button (if payout enabled)
- **Data:**
  - `/earnings`
  - `/payouts`
- **Integration:** Mpesa or Stripe payouts (phase 2)

### 📊 8.2 Influencer Analytics
- **Status:** ✅ Implemented
- **Sections:**
  - Performance overview (reach, engagement, growth)
  - Campaign performance history
  - Platform-specific metrics
  - Audience demographics
  - Content performance insights
- **Data:**
  - `/analytics/influencer`
  - `/analytics/campaigns`
  - `/analytics/audience`
- **Integration:** Social media APIs for real-time metrics

### 📈 8.3 Brand Analytics
- **Status:** ✅ Implemented
- **Route:** `/analytics`
- **Data:**
  - `/analytics/brand`
  - `/analytics/campaigns`
  - `/analytics/influencers`

---

## ⚙️ 9. Settings

### 🔧 9.1 Profile Settings
- **Status:** ✅ Implemented
- Update bio, social links, email, password

### 🌒 9.2 Theme / Preferences
- **Status:** ✅ Implemented
- Dark Mode toggle
- Notifications opt-in

### 🔐 9.3 Security
- **Status:** ✅ Implemented
- 2FA toggle
- Connected apps
- Logout

---

## 📬 10. Notifications

### 🔔 10.1 Notification System
- **Status:** ❌ Not Implemented
- **Route:** `/notifications` (Optional)
- **Components:**
  - Bell icon with notification count
  - Dropdown notification panel
  - Full notifications page (optional)
  - Real-time updates
- **Types:**
  - Campaign invites
  - Content approval status
  - Payment updates
  - System announcements
- **Data:** `/notifications`
- **Real-time:** Use WebSockets or polling
- **Priority:** Medium (can use basic implementation for now)

---

## 🧠 11. Admin Panel (Optional Phase 3)

### 👨‍💼 11.1 Admin Dashboard
- **Status:** ❌ Not Implemented (Phase 3)
- **Priority:** Low
- **Features:**
  - Manage brands and influencers
  - Moderate content
  - Fraud detection
  - Access logs and reports
  - Platform analytics

---

## 🚀 Implementation Status Summary

### ✅ **COMPLETED (95%)**
1. Authentication (Login/Signup) with onboarding integration
2. Onboarding Flows (Brand & Influencer)
3. Influencer Dashboard
4. Brand Dashboard
5. Campaign Creation & Management
6. Campaign Discovery & Application
7. Content Submission & Approval
8. Influencer Discovery
9. Public Influencer Profiles
10. Analytics (Brand & Influencer)
11. Earnings & Payments
12. Settings & Preferences

### ❌ **REMAINING (5%)**
1. **Notification System** - **Medium Priority**
2. **Admin Panel** - **Low Priority (Phase 3)**

### 🎯 **NEXT STEPS**
1. **Add Basic Notifications** - Important for engagement
2. **Polish & Testing** - Ensure quality
3. **Admin Panel** - Future phase

---

## 📋 **Missing Core Features Analysis**

### 🔥 **Critical Missing (Should Implement)**
- **Onboarding Flows**: First-time user experience after signup
- **Basic Notifications**: In-app notification system

### 💡 **Nice to Have (Can Defer)**
- **Advanced Notifications**: Real-time WebSocket notifications
- **Admin Panel**: Platform management interface

### ✨ **Enhancement Opportunities**
- **Email Templates**: For campaign invites, approvals
- **Mobile App**: React Native version
- **Advanced Analytics**: More detailed insights
- **API Documentation**: For third-party integrations

---

_Last updated: January 19, 2025_
_Last updated: January 19, 2025_
