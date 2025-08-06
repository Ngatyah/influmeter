import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { LoginScreen, SignupScreen } from './screens/auth'
import { InfluencerDashboard, BrandDashboard } from './screens/dashboard'
import { CreateCampaign, CampaignDetail, MyCampaigns } from './screens/campaign'
import { DiscoverInfluencers } from './screens/discover'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import BrowseCampaigns from './screens/campaigns/BrowseCampaigns';
import CampaignDetailInfluencer from './screens/campaigns/CampaignDetailInfluencer';
import CampaignApplication from './screens/campaigns/CampaignApplication';
import { SubmitContent, ContentApprovals } from './screens/content'
import { InfluencerEarnings } from './screens/earnings'
import { Settings } from './screens/settings'
import { BrandAnalytics, InfluencerAnalytics } from './screens/analytics'
import { InfluencerProfile } from './screens/profile'
import { InfluencerOnboarding, BrandOnboarding } from './screens/onboarding'
import InfluencerContentView from './screens/campaigns/InfluencerContentView'
import { ThemeProvider } from './components/ui/theme-provider';
import { authService } from './services/auth.service'

function App() {
  useEffect(() => {
    // Debug authentication state on app load
    const token = localStorage.getItem('access_token')
    const user = localStorage.getItem('user')
    
    console.log('App loaded - Auth state:', {
      isAuthenticated: authService.isAuthenticated(),
      hasToken: !!token,
      hasUser: !!user,
      currentPath: window.location.pathname
    })
    
    if (token && user) {
      console.log('User data:', JSON.parse(user))
    }
  }, [])

  return (
    <ThemeProvider defaultTheme="light" storageKey="influmeter-ui-theme">
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/signup" element={<SignupScreen />} />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/dashboard/influencer" 
              element={
                <ProtectedRoute role="influencer">
                  <InfluencerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/brand" 
              element={
                <ProtectedRoute role="brand">
                  <BrandDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Campaign Routes */}
            <Route 
              path="/campaigns" 
              element={
                <ProtectedRoute role="brand">
                  <MyCampaigns />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaigns/create" 
              element={
                <ProtectedRoute role="brand">
                  <CreateCampaign />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaigns/:id" 
              element={
                <ProtectedRoute role="brand">
                  <CampaignDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaigns/browse" 
              element={
                <ProtectedRoute role="influencer">
                  <BrowseCampaigns />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaigns/:id/details" 
              element={
                <ProtectedRoute role="influencer">
                  <CampaignDetailInfluencer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaigns/:id/apply" 
              element={
                <ProtectedRoute role="influencer">
                  <CampaignApplication />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/campaigns/:campaignId/submit" 
              element={
                <ProtectedRoute role="influencer">
                  <SubmitContent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/content/approvals" 
              element={
                <ProtectedRoute role="brand">
                  <ContentApprovals />
                </ProtectedRoute>
              } 
            />
            <Route path="/campaigns/:campaignId/influencer/:influencerId" element={<InfluencerContentView />} />
            
            {/* Discover Routes */}
            <Route 
              path="/discover/influencers" 
              element={
                <ProtectedRoute role="brand">
                  <DiscoverInfluencers />
                </ProtectedRoute>
              } 
            />
            
            {/* Earnings Route */}
            <Route 
              path="/earnings" 
              element={
                <ProtectedRoute role="influencer">
                  <InfluencerEarnings />
                </ProtectedRoute>
              } 
            />
            
            {/* Settings Route */}
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            
            {/* Analytics Routes */}
            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute role="brand">
                  <BrandAnalytics />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analytics/influencer" 
              element={
                <ProtectedRoute role="influencer">
                  <InfluencerAnalytics />
                </ProtectedRoute>
              } 
            />
            
            {/* Profile Routes */}
            <Route 
              path="/influencer/:id" 
              element={<InfluencerProfile />} 
            />
            
            {/* Onboarding Routes */}
            <Route 
              path="/onboarding/influencer" 
              element={
                <ProtectedRoute role="influencer">
                  <InfluencerOnboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/onboarding/brand" 
              element={
                <ProtectedRoute role="brand">
                  <BrandOnboarding />
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
