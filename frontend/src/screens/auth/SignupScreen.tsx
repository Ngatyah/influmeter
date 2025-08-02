import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Building2, UserPlus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import { signupUser } from '../../store/slices/authSlice'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Checkbox } from '../../components/ui/checkbox'
import { loginUser } from '../../store/slices/authSlice'

export default function SignupScreen() {
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
  
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { isLoading, error } = useAppSelector(state => state.auth)

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      return
    }
    
    if (!formData.agreeToTerms) {
      return
    }

    await dispatch(signupUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful signup response - new users need onboarding
      const userData = {
        id: '1',
        name: formData.name,
        email: formData.email,
        role: selectedRole,
        avatar: null,
        verified: false,
        onboardingCompleted: false // New users need to complete onboarding
      }

      // Store user data in Redux
      dispatch(loginUser(userData))
      
      // Redirect to appropriate onboarding flow for new users
      if (selectedRole === 'brand') {
        navigate('/onboarding/brand')
      } else {
        navigate('/onboarding/influencer')
      }
      
    } catch (error) {
      console.error('Signup failed:', error)
      // Handle error (show notification, etc.)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl font-bold text-primary-foreground">I</span>
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Influmeter</h1>
          <p className="text-muted-foreground">Connect. Create. Collaborate.</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-slate-800 mb-2">
              Join Influmeter
            </CardTitle>
            <p className="text-slate-600">
              Create your account to get started
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8 pb-8">
            {/* Enhanced Role Selection */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-slate-700">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={formData.role === 'influencer' ? 'default' : 'outline'}
                  className={`h-14 text-sm font-medium transition-all duration-200 ${
                    formData.role === 'influencer' 
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25' 
                      : 'border-2 border-slate-200 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  onClick={() => handleInputChange('role', 'influencer')}
                >
                  <User className="w-5 h-5 mr-2" />
                  Influencer
                </Button>
                <Button
                  type="button"
                  variant={formData.role === 'brand' ? 'default' : 'outline'}
                  className={`h-14 text-sm font-medium transition-all duration-200 ${
                    formData.role === 'brand' 
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25' 
                      : 'border-2 border-slate-200 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                  onClick={() => handleInputChange('role', 'brand')}
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  Brand
                </Button>
              </div>
            </div>

            {/* Enhanced Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-slate-700">
                  {formData.role === 'brand' ? 'Brand Name' : 'Full Name'}
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={formData.role === 'brand' ? 'Enter brand name' : 'Enter your full name'}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="pl-12 h-12 border-2 border-slate-200 focus:border-primary transition-colors bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-12 h-12 border-2 border-slate-200 focus:border-primary transition-colors bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-12 pr-12 h-12 border-2 border-slate-200 focus:border-primary transition-colors bg-white"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-slate-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-slate-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-12 pr-12 h-12 border-2 border-slate-200 focus:border-primary transition-colors bg-white"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                />
                <label htmlFor="terms" className="text-sm text-slate-600 leading-relaxed">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-md">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-medium shadow-lg shadow-primary/25 transition-all duration-200 hover:shadow-xl hover:shadow-primary/30"
                disabled={isLoading || !formData.agreeToTerms}
              >
                {isLoading ? (
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

            {/* Enhanced Sign In Link */}
            <div className="text-center pt-4 border-t border-slate-100">
              <p className="text-slate-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors"
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
