# 🧠 Influmeter Backend Architecture (NestJS)

## 📌 Overview

Influmeter is a modern influencer performance and campaign analytics platform. The backend is built on **NestJS** and is responsible for handling user authentication, influencer-brand interactions, campaign tracking, referral analytics, AI-driven suggestions, and more.

---

## 🏗 Tech Stack

- **Framework**: NestJS (Node.js)
- **ORM**: TypeORM or Prisma (PostgreSQL)
- **Database**: PostgreSQL
- **Cache**: Redis (for sessions, rate limits)
- **File Storage**: Cloudinary / AWS S3 (influencer media)
- **Auth**: JWT + OAuth2 (for social platform auth)
- **Queue**: BullMQ + Redis (background jobs)
- **Logging**: Winston + LogRocket integration
- **AI Suggestions**: GPT-based APIs (OpenAI or Claude)
- **Monitoring**: Sentry, Prometheus + Grafana

---

## 🧩 Core Modules

### 1. **Auth Module**
- JWT-based login for Influencers, Brands, Admin
- Google/Facebook login for Influencers
- Password-based login for Brands
- Token refresh & expiration handling

### 2. **Users Module**
- `User` entity with polymorphic roles:
  - Influencer
  - Brand
  - Admin
- Profile setup, editing, verification
- Public profile view endpoint (for Discover)

### 3. **Campaigns Module**
- Brand creates campaigns with:
  - Name, Budget, Duration, Objective
  - Target influencers (filters or direct invite)
- Campaign approval lifecycle:
  - Draft → Submitted → Approved → Completed
- Content uploads + approvals (image/video + caption)

### 4. **Influencer Module**
- Influencer dashboard metrics (followers, reach, engagement)
- Auto-sync data from social platforms (see below)
- Referral link/code generation per campaign
- Access to brand campaigns (if qualified)
- Application & rebooking logic

### 5. **Social Integration Module**
- OAuth2 Authentication (YouTube, Instagram, TikTok)
- Fetch metrics via APIs:
  - Followers
  - Reach & impressions
  - Engagement (likes, comments, views)
- Periodic sync via background jobs (BullMQ)

### 6. **Referral & Conversion Tracking Module**
- Each influencer gets a:
  - Unique referral link (e.g., `influmeter.com/go/murugi`)
  - Unique code (e.g., `MURUGI25`)
- Brands embed code input field or use UTM parameters
- Collect:
  - Click-through data
  - Sales/conversions via webhook
  - Attribution percentage per influencer

### 7. **AI Suggestion Engine**
- GPT-generated campaign reports (every X days)
- Example:
  > “Murugi and Njugush generated 80% of total engagement. Consider increasing their budget.”
- Aggregates analytics → feeds prompt to GPT → delivers insights to dashboard

### 8. **Admin Module**
- Moderate users and campaigns
- Resolve disputes
- Review flagged content
- Generate platform-wide reports
- Revenue analytics (from subscriptions or performance-based payments)

---

## 🔁 Background Jobs

- Fetch influencer data (daily/weekly)
- Track referral link activity
- Generate AI summaries
- Email notifications (approval, content status, campaign expiry)

---

## 🧠 AI Integration

- GPT/Claude prompt ingestion service
- Receives:
  - Campaign stats
  - Engagement performance
  - Influencer metadata
- Returns:
  - Summarized reports
  - Smart suggestions for next campaigns

---

## 📡 Webhooks & APIs

- Brand e-commerce webhook:
  - Notify Influmeter on conversion events
  - Capture `referralCode` or `referralLink`
- Social platforms (poll-based or webhook if available)

---

## 🔒 Security & Permissions

- RBAC: Influencer, Brand, Admin roles
- Secure file uploads
- Data masking on public APIs
- Rate limiting, brute-force protection
- Audit logs for campaign/content changes

---

## 📊 Analytics Module

- Performance metrics per influencer & campaign
- Filters: Region, Gender, Follower count, Industry
- Leaderboards
- Exportable reports

---

## 🔌 API Structure (REST or GraphQL)

- `/auth/login`, `/auth/oauth`
- `/users/me`, `/users/:id`
- `/brands/campaigns`, `/brands/influencers`
- `/influencers/campaigns`, `/influencers/stats`
- `/admin/dashboard`, `/admin/users`

---

## 🧪 Testing & CI/CD

- Unit tests (Jest)
- Integration tests
- Swagger/OpenAPI docs
- CI/CD (GitHub Actions + Docker)
- Environments: dev, staging, production

---

## 📁 Folder Structure (NestJS)

```
src/
├── auth/
├── users/
├── influencers/
├── brands/
├── campaigns/
├── social-integrations/
├── ai-suggestions/
├── referrals/
├── admin/
├── common/
├── config/
└── main.ts
```

---

## 📈 Scalability Notes

- Stateless APIs + JWT = horizontal scaling
- Use Redis for caching influencer metrics
- Offload heavy tasks to background jobs
- DB read replicas if needed
- Consider sharding campaigns per region for large scale

---

## ✅ MVP Focus Areas

1. Auth (JWT + Role-based)
2. Campaign creation + approval flow
3. Influencer onboarding + metrics
4. Referral code/link tracking
5. Basic AI suggestion prompt
6. Admin moderation