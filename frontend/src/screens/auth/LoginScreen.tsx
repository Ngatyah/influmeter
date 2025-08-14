import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Building2, LogIn } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { loginUser } from '../../store/slices/authSlice'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'influencer' | 'brand'>('influencer')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { error, isAuthenticated, user } = useAppSelector(state => state.auth)

  // Navigate to dashboard after successful login
  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     if (user.role === 'influencer') {
  //       navigate('/dashboard/influencer')
  //     } else if (user.role === 'brand') {
  //       navigate('/dashboard/brand')
  //     }
  //   }
  // }, [isAuthenticated, user, navigate])

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   await dispatch(loginUser({ email, password, role }))
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Use Redux action to handle login with backend
      const result = await dispatch(loginUser({ email, password, role }))
      
      if (loginUser.fulfilled.match(result)) {
        // Navigate based on backend response
        const redirectTo = result.payload?.redirectTo || `/dashboard/${role}`
        console.log('Login successful, redirecting to:', redirectTo)
        navigate(redirectTo)
      } else {
        // Handle login failure
        console.error('Login failed:', result.payload)
      }
      
    } catch (error) {
      console.error('Login failed:', error)
      // Handle error (show notification, etc.)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-2xl mb-3 sm:mb-4 shadow-lg">
            <span className="text-xl sm:text-2xl font-bold text-primary-foreground">I</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1 sm:mb-2">Influmeter</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Connect. Create. Collaborate.</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-3 sm:pb-4 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl font-semibold text-slate-800 mb-1 sm:mb-2">
              Welcome Back
            </CardTitle>
            <p className="text-sm sm:text-base text-slate-600">
              Sign in to your account
            </p>
          </CardHeader>
          
          <CardContent className="space-y-5 sm:space-y-6 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
            {/* Enhanced Role Selection */}
            <div className="space-y-3 sm:space-y-4">
              <label className="text-sm font-semibold text-slate-700">I am a</label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant={role === 'influencer' ? 'default' : 'outline'}
                  className={`h-12 sm:h-14 text-xs sm:text-sm font-medium transition-all duration-200 ${
                    role === 'influencer' 
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25' 
                      : 'border-2 border-slate-200 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  onClick={() => setRole('influencer')}
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Influencer</span>
                  <span className="xs:hidden">Creator</span>
                </Button>
                <Button
                  type="button"
                  variant={role === 'brand' ? 'default' : 'outline'}
                  className={`h-12 sm:h-14 text-xs sm:text-sm font-medium transition-all duration-200 ${
                    role === 'brand' 
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25' 
                      : 'border-2 border-slate-200 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  onClick={() => setRole('brand')}
                >
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Brand
                </Button>
              </div>
            </div>

            {/* Enhanced Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 sm:pl-12 h-11 sm:h-12 border-2 border-slate-200 focus:border-primary transition-colors bg-white text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-11 sm:h-12 border-2 border-slate-200 focus:border-primary transition-colors bg-white text-sm sm:text-base"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-slate-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="p-3 sm:p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 sm:h-12 bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30 text-sm sm:text-base"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    <span className="text-sm sm:text-base">Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="text-sm sm:text-base">Sign In</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Enhanced OAuth Options */}
            <div className="space-y-3 sm:space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 sm:px-4 text-slate-500 font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button 
                  variant="outline" 
                  className="h-10 sm:h-12 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-xs sm:text-sm"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </Button>
                <Button 
                  variant="outline" 
                  className="h-10 sm:h-12 border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 text-xs sm:text-sm"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple
                </Button>
              </div>
            </div>

            {/* Enhanced Sign Up Link */}
            <div className="text-center pt-3 sm:pt-4 border-t border-slate-100">
              <p className="text-sm sm:text-base text-slate-600">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
    
