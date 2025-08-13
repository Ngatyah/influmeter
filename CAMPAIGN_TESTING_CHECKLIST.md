# Campaign Management Testing Checklist

## Complete End-to-End Workflow Test

### Prerequisites
1. ✅ Backend running on `http://localhost:3000`
2. ✅ Frontend running on `http://localhost:5173`
3. ✅ Database connected and migrated
4. ✅ Two test users: one Brand, one Influencer

---

## 🏢 Brand User Flow

### 1. Authentication & Onboarding
- [ ] Login as Brand user
- [ ] Complete brand onboarding (if not done)
- [ ] Access Brand Dashboard

### 2. Campaign Creation
- [ ] Navigate to "Create Campaign" 
- [ ] Fill out campaign form with:
  - Title: "Test Summer Campaign"
  - Objective: "Brand Awareness" 
  - Description: "Test campaign description"
  - Budget: $1000
  - Timeline: Start/End dates
  - Target criteria and requirements
- [ ] Save as Draft - verify shows in "My Campaigns"
- [ ] Launch Campaign - status changes to ACTIVE

### 3. Campaign Management
- [ ] View "My Campaigns" dashboard
- [ ] Check campaign statistics and counts
- [ ] Filter campaigns by status (All, Active, Draft, etc.)
- [ ] Search campaigns by title
- [ ] View campaign detail page
- [ ] Verify campaign status management (Active ↔ Paused)

### 4. Application Review
- [ ] Navigate to campaign with applications
- [ ] View submitted applications list
- [ ] Review application details
- [ ] Accept/Reject applications
- [ ] Verify participant count updates

---

## 👩‍💻 Influencer User Flow

### 1. Authentication & Onboarding  
- [ ] Login as Influencer user
- [ ] Complete influencer onboarding (if not done)
- [ ] Access Influencer Dashboard

### 2. Campaign Discovery
- [ ] Navigate to "Browse Campaigns"
- [ ] View campaign grid with real data
- [ ] Use search functionality
- [ ] Apply filters (budget, platforms, niches)
- [ ] Bookmark campaigns (heart icon)
- [ ] View campaign counts and pagination

### 3. Campaign Application
- [ ] Click on campaign card → "View Details"
- [ ] Review campaign information in tabs:
  - Brief with full description
  - Requirements and criteria
  - Terms and conditions
  - Assets (if available)
- [ ] Click "Apply Now" button
- [ ] Fill application form:
  - Motivation (required)
  - Content ideas (required)
  - Timeline proposal (optional)
  - Portfolio links (optional)
  - Accept all agreements (required)
- [ ] Submit application
- [ ] See success confirmation
- [ ] Verify "Applied" status on campaign

---

## 🔄 Integration Testing

### Backend API Testing
Use the `test_campaign_workflow.http` file to test:

1. **Authentication Endpoints**
   - [ ] POST `/auth/login` - Brand login
   - [ ] POST `/auth/login` - Influencer login

2. **Campaign CRUD Operations**
   - [ ] POST `/campaigns` - Create campaign
   - [ ] GET `/campaigns/my-campaigns` - List brand campaigns
   - [ ] GET `/campaigns/:id` - Get single campaign
   - [ ] PUT `/campaigns/:id` - Update campaign
   - [ ] PUT `/campaigns/:id/status` - Update status

3. **Campaign Discovery**
   - [ ] GET `/campaigns/browse` - Browse campaigns
   - [ ] GET `/campaigns/browse?search=test` - Search
   - [ ] GET `/campaigns/browse?minBudget=500` - Filter

4. **Application Management**
   - [ ] POST `/campaigns/:id/apply` - Submit application
   - [ ] GET `/campaigns/:id/applications` - List applications
   - [ ] PUT `/campaigns/applications/:id/status` - Accept/reject

### Error Handling
- [ ] Invalid authentication tokens
- [ ] Missing required fields
- [ ] Duplicate applications
- [ ] Non-existent resources
- [ ] Network timeouts

---

## 🎯 Critical Test Scenarios

### Scenario 1: Complete Happy Path
1. Brand creates → launches campaign
2. Influencer discovers → applies to campaign  
3. Brand reviews → accepts application
4. Campaign shows updated participant count

### Scenario 2: Multiple Applications
1. Multiple influencers apply to same campaign
2. Brand can see all applications
3. Brand accepts some, rejects others
4. Counts update correctly

### Scenario 3: Campaign Lifecycle
1. Campaign: Draft → Active → Paused → Active → Completed
2. Status changes reflect in both Brand and Influencer views
3. Applications only allowed for ACTIVE campaigns

### Scenario 4: Search & Filter
1. Create campaigns with different budgets/titles
2. Test search functionality works
3. Test filters return correct results
4. Test pagination if multiple pages

---

## ⚠️ Expected Issues to Check

### Data Display Issues
- [ ] Campaign dates display correctly
- [ ] Budget amounts formatted properly
- [ ] Brand names/logos show correctly
- [ ] Participant counts accurate
- [ ] Status indicators correct colors

### UI/UX Issues
- [ ] Loading states show during API calls
- [ ] Error messages are user-friendly
- [ ] Form validation works properly
- [ ] Buttons disabled when appropriate
- [ ] Navigation works between screens

### Backend Issues
- [ ] CORS headers configured
- [ ] JWT tokens expire appropriately
- [ ] Database queries optimized
- [ ] Error responses formatted correctly
- [ ] Validation messages clear

---

## 📊 Success Criteria

✅ **Workflow Complete** when:
- Brand can create, manage, and complete campaigns
- Influencers can discover and apply to campaigns
- Applications are properly tracked and managed
- All data flows correctly between frontend and backend
- Error states are handled gracefully
- UI remains responsive and user-friendly

---

## 🐛 Bug Reporting

For any issues found, note:
1. **Steps to reproduce**
2. **Expected behavior**
3. **Actual behavior** 
4. **Browser/environment details**
5. **Console errors** (if any)

---

## 🚀 Ready for Production?

- [ ] All critical workflows tested
- [ ] Error handling verified
- [ ] Performance acceptable
- [ ] UI/UX polished
- [ ] Backend APIs stable
- [ ] Data persistence working