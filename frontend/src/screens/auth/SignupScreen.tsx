import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Building2, UserPlus } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Checkbox } from '../../components/ui/checkbox'
import { authService } from '../../services/auth.service'

export default function SignupScreen() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'influencer' as 'influencer' | 'brand',
    agreeToTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('') // Clear error when user types
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const response = await authService.signup({
        email: formData.email,
        password: formData.password,
        role: formData.role
      })

      console.log('Signup successful:', response)
      
      // Navigate based on backend response (usually onboarding)
      navigate(response.redirectTo)
      
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
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
              Join Influmeter
            </CardTitle>
            <p className="text-sm sm:text-base text-slate-600">
              Create your account to get started
            </p>
          </CardHeader>
          
          <CardContent className="space-y-5 sm:space-y-6 px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
            {/* Error Display */}
            {error && (
              <div className="p-3 sm:p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Enhanced Role Selection */}
            <div className="space-y-3 sm:space-y-4">
              <label className="text-sm font-semibold text-slate-700">I am a</label>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button
                  type="button"
                  variant={formData.role === 'influencer' ? 'default' : 'outline'}
                  className={`h-12 sm:h-14 text-xs sm:text-sm font-medium transition-all duration-200 ${
                    formData.role === 'influencer' 
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25' 
                      : 'border-2 border-slate-200 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  onClick={() => handleInputChange('role', 'influencer')}
                  disabled={loading}
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">Influencer</span>
                  <span className="xs:hidden">Creator</span>
                </Button>
                <Button
                  type="button"
                  variant={formData.role === 'brand' ? 'default' : 'outline'}
                  className={`h-12 sm:h-14 text-xs sm:text-sm font-medium transition-all duration-200 ${
                    formData.role === 'brand' 
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25' 
                      : 'border-2 border-slate-200 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  onClick={() => handleInputChange('role', 'brand')}
                  disabled={loading}
                >
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Brand
                </Button>
              </div>
            </div>

            {/* Enhanced Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-1 sm:space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-700">
                  {formData.role === 'brand' ? 'Brand Name' : 'Full Name'}
                </label>
                <div className="relative group">
                  <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={formData.role === 'brand' ? 'Enter brand name' : 'Enter your full name'}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-10 sm:pl-12 h-11 sm:h-12 border-2 border-slate-200 focus:border-primary transition-colors bg-white text-sm sm:text-base"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

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
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-10 sm:pl-12 h-11 sm:h-12 border-2 border-slate-200 focus:border-primary transition-colors bg-white text-sm sm:text-base"
                    required
                    disabled={loading}
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
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-10 sm:pl-12 pr-10 sm:pr-12 h-11 sm:h-12 border-2 border-slate-200 focus:border-primary transition-colors bg-white text-sm sm:text-base"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-slate-100"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Must be at least 6 characters</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-12 pr-12 h-12 border-2 border-slate-200 focus:border-indigo-600 transition-colors bg-white"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Enhanced Terms and Conditions */}
              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-lg border-2 border-slate-100">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                  disabled={loading}
                />
                <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-indigo-600 hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-indigo-600 hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-lg shadow-indigo-600/25 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-600/30"
                disabled={loading || !formData.agreeToTerms}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="w-5 h-5 mr-2" />
                    Create Account
                  </div>
                )}
              </Button>
            </form>

            {/* Google Signup Option */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12"
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </Button>

            {/* Enhanced Sign In Link */}
            <div className="text-center pt-4 border-t border-slate-100">
              <p className="text-slate-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
