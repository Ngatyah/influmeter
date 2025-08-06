import React, { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../hooks/redux'

interface ProtectedRouteProps {
  children: React.ReactNode
  role?: 'influencer' | 'brand'
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('ProtectedRoute check:', {
      isAuthenticated,
      user,
      requiredRole: role,
      userRole: user?.role,
      userRoleLowercase: user?.role?.toLowerCase(),
      currentPath: window.location.pathname
    })

    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login')
      navigate('/login')
      return
    }

    if (role && user?.role?.toLowerCase() !== role) {
      console.log(`Wrong role: required ${role}, got ${user?.role?.toLowerCase()}`)
      // Redirect to appropriate dashboard if wrong role
      navigate(`/dashboard/${user?.role?.toLowerCase()}`)
      return
    }

    // Check if user needs to complete onboarding (except for onboarding routes)
    const currentPath = window.location.pathname
    const isOnboardingRoute = currentPath.includes('/onboarding/')
    
    // if (!isOnboardingRoute && !user?.onboardingCompleted) {
    //   // Redirect to onboarding if not completed
    //   navigate(`/onboarding/${user?.role}`)
    //   return
    // }
  }, [isAuthenticated, user, role, navigate])

  return <>{children}</>
}

export default ProtectedRoute
