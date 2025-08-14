import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Palette,
  Bell,
  LogOut,
  Camera,
  Instagram,
  Youtube,
  Twitter,
  Globe,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  Lock,
  Moon,
  Sun,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Package,
  Plus,
  Edit,
  Trash2,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logoutUser } from '../../store/slices/authSlice'
import { portfolioManagementService, PortfolioItem, CreatePortfolioItemData } from '../../services/portfolio.service'
import { packagesManagementService, InfluencerPackage, CreatePackageData } from '../../services/packages.service'
import { usersService, User as UserType, BrandProfile } from '../../services/users.service'

export default function Settings() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: '',
    phone: '',
    website: '',
    socialLinks: {
      instagram: '',
      youtube: '',
      twitter: '',
      tiktok: ''
    }
  })

  // Security state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  })

  // Preferences state
  const [preferences, setPreferences] = useState({
    darkMode: localStorage.getItem('theme') === 'dark',
    emailNotifications: true,
    pushNotifications: true,
    campaignUpdates: true,
    paymentAlerts: true
  })

  // Portfolio state (for influencers only)
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [portfolioLoading, setPortfolioLoading] = useState(false)

  // Packages state (for influencers only)  
  const [packages, setPackages] = useState<InfluencerPackage[]>([])
  const [packagesLoading, setPackagesLoading] = useState(false)

  // Form states
  const [showPackageForm, setShowPackageForm] = useState(false)
  const [editingPackage, setEditingPackage] = useState<InfluencerPackage | null>(null)

  // Brand state (for brands only)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [brandData, setBrandData] = useState<BrandProfile>({
    companyName: '',
    industry: [],
    website: '',
    logoUrl: '',
    description: '',
    targetAudience: '',
    brandValues: [],
    marketingGoals: []
  })
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const [packageForm, setPackageForm] = useState<CreatePackageData>({
    platform: 'Instagram',
    packageType: 'Post',
    title: '',
    description: '',
    price: 0,
    deliverables: [''],
    turnaroundDays: 3,
    revisions: 1,
    isActive: true
  })

  const handleProfileUpdate = async () => {
    try {
      setLoading(true)
      
      if (user?.role === 'BRAND') {
        // Update brand profile
        await usersService.updateProfile({
          firstName: profileData.name.split(' ')[0],
          lastName: profileData.name.split(' ').slice(1).join(' '),
          phoneNumber: profileData.phone,
          bio: profileData.bio
        })
        // Also update brand-specific data if needed
        console.log('Brand profile updated successfully')
      } else {
        // Update regular profile
        await usersService.updateProfile({
          firstName: profileData.name.split(' ')[0],
          lastName: profileData.name.split(' ').slice(1).join(' '),
          phoneNumber: profileData.phone,
          bio: profileData.bio
        })
      }
      
      setIsEditing(false)
      // Reload user data
      await loadCurrentUser()
    } catch (error) {
      console.error('Failed to update profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBrandProfileUpdate = async () => {
    try {
      setLoading(true)
      
      let logoUrl = brandData.logoUrl

      // First upload logo if a new file was selected
      if (logoFile) {
        const uploadResult = await usersService.uploadLogo(logoFile)
        logoUrl = uploadResult.logoUrl
      }

      // Update both user profile and brand profile
      await Promise.all([
        // Update basic user profile (contact person, phone)
        usersService.updateProfile({
          firstName: profileData.name.split(' ')[0],
          lastName: profileData.name.split(' ').slice(1).join(' '),
          phoneNumber: profileData.phone,
          bio: brandData.description
        }),
        // Update brand-specific profile (only if logoFile wasn't uploaded, as upload already updates it)
        !logoFile && usersService.updateBrandProfile({
          ...brandData,
          logoUrl
        })
      ].filter(Boolean))
      
      // If logo was uploaded, the backend already updated brandData.logoUrl
      if (!logoFile) {
        setBrandData({...brandData, logoUrl})
      }
      
      setIsEditing(false)
      setLogoFile(null)
      
      // Reload user data
      await loadCurrentUser()
      
      console.log('Brand profile updated successfully')
    } catch (error) {
      console.error('Failed to update brand profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (securityData.newPassword !== securityData.confirmPassword) {
      // Show error
      return
    }
    // Simulate API call
    console.log('Changing password')
    setSecurityData({
      ...securityData,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const handlePreferencesUpdate = async () => {
    // Update theme
    const theme = preferences.darkMode ? 'dark' : 'light'
    localStorage.setItem('theme', theme)
    document.documentElement.classList.toggle('dark', preferences.darkMode)
    
    // Simulate API call for other preferences
    console.log('Updating preferences:', preferences)
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate('/login')
  }

  // Load portfolio data
  const loadPortfolio = async () => {
    if (user?.role !== 'INFLUENCER') return
    
    try {
      setPortfolioLoading(true)
      const data = await portfolioManagementService.getMyPortfolio()
      setPortfolio(data)
    } catch (error) {
      console.error('Failed to load portfolio:', error)
    } finally {
      setPortfolioLoading(false)
    }
  }

  // Load packages data  
  const loadPackages = async () => {
    if (user?.role !== 'INFLUENCER') return
    
    try {
      setPackagesLoading(true)
      const data = await packagesManagementService.getMyPackages()
      setPackages(data)
    } catch (error) {
      console.error('Failed to load packages:', error)
    } finally {
      setPackagesLoading(false)
    }
  }

  // Load current user data
  const loadCurrentUser = async () => {
    try {
      setLoading(true)
      const userData = await usersService.getCurrentUser()
      setCurrentUser(userData)
      
      // Populate profile data from loaded user
      if (userData.profile) {
        setProfileData({
          name: userData.profile.firstName && userData.profile.lastName 
            ? `${userData.profile.firstName} ${userData.profile.lastName}`
            : userData.profile.firstName || user?.name || '',
          email: userData.email || '',
          bio: userData.profile.bio || '',
          phone: userData.profile.phoneNumber || '',
          website: '',
          socialLinks: {
            instagram: '',
            youtube: '',
            twitter: '',
            tiktok: ''
          }
        })
      }
      
      // Populate brand data if user is a brand
      if (user?.role === 'BRAND' && userData.brandProfile) {
        setBrandData({
          companyName: userData.brandProfile.companyName || '',
          industry: Array.isArray(userData.brandProfile.industry) ? userData.brandProfile.industry : [],
          website: userData.brandProfile.website || '',
          logoUrl: userData.brandProfile.logoUrl || '',
          description: userData.brandProfile.description || '',
          targetAudience: userData.brandProfile.targetAudience || '',
          brandValues: Array.isArray(userData.brandProfile.brandValues) ? userData.brandProfile.brandValues : [],
          marketingGoals: Array.isArray(userData.brandProfile.marketingGoals) ? userData.brandProfile.marketingGoals : []
        })
      }
    } catch (error) {
      console.error('Failed to load current user:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadCurrentUser()
    if (user?.role === 'INFLUENCER') {
      loadPortfolio()
      loadPackages()
    }
  }, [user?.role])

  // Portfolio is now auto-generated from campaigns - no manual CRUD needed

  // Package form handlers  
  const handlePackageSubmit = async () => {
    try {
      const submitData = {
        ...packageForm,
        deliverables: packageForm.deliverables.filter(d => d.trim() !== '')
      }
      
      if (editingPackage) {
        await packagesManagementService.updatePackage(editingPackage.id!, submitData)
      } else {
        await packagesManagementService.createPackage(submitData)
      }
      
      // Reset form and reload data
      setShowPackageForm(false)
      setEditingPackage(null)
      setPackageForm({
        platform: 'Instagram', packageType: 'Post', title: '', description: '', 
        price: 0, deliverables: [''], turnaroundDays: 3, revisions: 1, isActive: true
      })
      loadPackages()
    } catch (error) {
      console.error('Failed to save package:', error)
    }
  }

  const handlePackageEdit = (pkg: InfluencerPackage) => {
    setEditingPackage(pkg)
    setPackageForm({
      platform: pkg.platform,
      packageType: pkg.packageType,
      title: pkg.title || '',
      description: pkg.description || '',
      price: pkg.price,
      deliverables: pkg.deliverables.length > 0 ? pkg.deliverables : [''],
      turnaroundDays: pkg.turnaroundDays || 3,
      revisions: pkg.revisions || 1,
      isActive: pkg.isActive !== false
    })
    setShowPackageForm(true)
  }

  const handlePackageDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      try {
        await packagesManagementService.deletePackage(id)
        loadPackages()
      } catch (error) {
        console.error('Failed to delete package:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/${user?.role}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
              <p className="text-slate-600">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full ${user?.role === 'INFLUENCER' ? 'grid-cols-6' : 'grid-cols-4'}`}>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center space-x-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Preferences</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            {user?.role === 'INFLUENCER' && (
              <>
                <TabsTrigger value="portfolio" className="flex items-center space-x-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden sm:inline">Portfolio</span>
                </TabsTrigger>
                <TabsTrigger value="packages" className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span className="hidden sm:inline">Packages</span>
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="mt-6">
            <div className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => isEditing ? (user?.role === 'BRAND' ? handleBrandProfileUpdate() : handleProfileUpdate()) : setIsEditing(true)}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : isEditing ? 'Save Changes' : 'Edit Profile'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar/Logo */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={
                          user?.role === 'BRAND' 
                            ? (brandData.logoUrl || currentUser?.brandProfile?.logoUrl || '/api/placeholder/80/80')
                            : (user?.avatar || currentUser?.profile?.avatar || '/api/placeholder/80/80')
                        }
                        alt={user?.role === 'BRAND' ? 'Company Logo' : 'Profile'}
                        className={`w-20 h-20 object-cover ${user?.role === 'BRAND' ? 'rounded-lg' : 'rounded-full'}`}
                      />
                      {isEditing && (
                        <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors cursor-pointer">
                          <Camera className="w-5 h-5" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file && user?.role === 'BRAND') {
                                setLogoFile(file)
                                setBrandData({...brandData, logoUrl: URL.createObjectURL(file)})
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {user?.role === 'BRAND' 
                          ? (brandData.companyName || currentUser?.brandProfile?.companyName || 'Company Name')
                          : (currentUser?.profile?.firstName && currentUser?.profile?.lastName 
                              ? `${currentUser.profile.firstName} ${currentUser.profile.lastName}`
                              : user?.name || 'User Name'
                            )
                        }
                      </h3>
                      <p className="text-sm text-slate-600 capitalize">{user?.role}</p>
                      {user?.verified && (
                        <Badge className="mt-1 bg-blue-100 text-blue-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                      {user?.role === 'BRAND' && brandData.industry && Array.isArray(brandData.industry) && brandData.industry.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1">{brandData.industry.join(', ')}</p>
                      )}
                    </div>
                  </div>

                  {/* Basic Info */}
                  {user?.role === 'BRAND' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Company Name
                        </label>
                        <Input
                          value={brandData.companyName}
                          onChange={(e) => setBrandData({...brandData, companyName: e.target.value})}
                          disabled={!isEditing}
                          placeholder="Your Company Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Website
                        </label>
                        <Input
                          value={brandData.website}
                          onChange={(e) => setBrandData({...brandData, website: e.target.value})}
                          disabled={!isEditing}
                          type="url"
                          placeholder="https://your-website.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email Address
                        </label>
                        <Input
                          value={currentUser?.email || ''}
                          disabled={true}
                          type="email"
                          className="bg-slate-50"
                        />
                        <p className="text-xs text-slate-500 mt-1">Email cannot be changed here</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Contact Person
                        </label>
                        <Input
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          disabled={!isEditing}
                          placeholder="Contact person name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          disabled={!isEditing}
                          type="tel"
                          placeholder="+254 712 345 678"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Target Audience
                        </label>
                        <Input
                          value={brandData.targetAudience}
                          onChange={(e) => setBrandData({...brandData, targetAudience: e.target.value})}
                          disabled={!isEditing}
                          placeholder="e.g., Young adults 18-35"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Full Name
                        </label>
                        <Input
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email Address
                        </label>
                        <Input
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          disabled={!isEditing}
                          type="email"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          disabled={!isEditing}
                          type="tel"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Website
                        </label>
                        <Input
                          value={profileData.website}
                          onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                          disabled={!isEditing}
                          type="url"
                        />
                      </div>
                    </div>
                  )}

                  {/* Bio/Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {user?.role === 'BRAND' ? 'Company Description' : 'Bio'}
                    </label>
                    <textarea
                      value={user?.role === 'BRAND' ? brandData.description : profileData.bio}
                      onChange={(e) => user?.role === 'BRAND' 
                        ? setBrandData({...brandData, description: e.target.value})
                        : setProfileData({...profileData, bio: e.target.value})
                      }
                      disabled={!isEditing}
                      className="w-full h-24 p-3 border border-slate-200 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
                      maxLength={500}
                      placeholder={user?.role === 'BRAND' ? 'Describe your company and what you do...' : 'Tell us about yourself...'}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {(user?.role === 'BRAND' ? brandData.description : profileData.bio).length}/500 characters
                    </p>
                  </div>

                  {/* Brand-specific fields */}
                  {user?.role === 'BRAND' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Industry (comma-separated)
                        </label>
                        <Input
                          value={Array.isArray(brandData.industry) ? brandData.industry.join(', ') : ''}
                          onChange={(e) => setBrandData({...brandData, industry: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                          disabled={!isEditing}
                          placeholder="e.g., Technology, Fashion, Food & Beverage"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Brand Values (comma-separated)
                          </label>
                          <Input
                            value={Array.isArray(brandData.brandValues) ? brandData.brandValues.join(', ') : ''}
                            onChange={(e) => setBrandData({...brandData, brandValues: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                            disabled={!isEditing}
                            placeholder="e.g., Quality, Innovation, Sustainability"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Marketing Goals (comma-separated)
                          </label>
                          <Input
                            value={Array.isArray(brandData.marketingGoals) ? brandData.marketingGoals.join(', ') : ''}
                            onChange={(e) => setBrandData({...brandData, marketingGoals: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                            disabled={!isEditing}
                            placeholder="e.g., Brand Awareness, Lead Generation, Sales"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Social Links */}
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Social Media Links</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-2">
                          <Instagram className="w-4 h-4 text-pink-500" />
                          <span>Instagram</span>
                        </label>
                        <Input
                          value={profileData.socialLinks.instagram}
                          onChange={(e) => setProfileData({
                            ...profileData, 
                            socialLinks: {...profileData.socialLinks, instagram: e.target.value}
                          })}
                          disabled={!isEditing}
                          placeholder="@username"
                        />
                      </div>
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-2">
                          <Youtube className="w-4 h-4 text-red-500" />
                          <span>YouTube</span>
                        </label>
                        <Input
                          value={profileData.socialLinks.youtube}
                          onChange={(e) => setProfileData({
                            ...profileData, 
                            socialLinks: {...profileData.socialLinks, youtube: e.target.value}
                          })}
                          disabled={!isEditing}
                          placeholder="@channel"
                        />
                      </div>
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-2">
                          <Twitter className="w-4 h-4 text-blue-500" />
                          <span>Twitter/X</span>
                        </label>
                        <Input
                          value={profileData.socialLinks.twitter}
                          onChange={(e) => setProfileData({
                            ...profileData, 
                            socialLinks: {...profileData.socialLinks, twitter: e.target.value}
                          })}
                          disabled={!isEditing}
                          placeholder="@username"
                        />
                      </div>
                      <div>
                        <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mb-2">
                          <Globe className="w-4 h-4 text-purple-500" />
                          <span>TikTok</span>
                        </label>
                        <Input
                          value={profileData.socialLinks.tiktok}
                          onChange={(e) => setProfileData({
                            ...profileData, 
                            socialLinks: {...profileData.socialLinks, tiktok: e.target.value}
                          })}
                          disabled={!isEditing}
                          placeholder="@username"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Preferences */}
          <TabsContent value="preferences" className="mt-6">
            <div className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Theme & Display</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {preferences.darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      <div>
                        <p className="font-medium">Dark Mode</p>
                        <p className="text-sm text-slate-600">Toggle dark theme</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const newPrefs = {...preferences, darkMode: !preferences.darkMode}
                        setPreferences(newPrefs)
                        handlePreferencesUpdate()
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.darkMode ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.darkMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                    { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications' },
                    { key: 'campaignUpdates', label: 'Campaign Updates', desc: 'Updates about your campaigns' },
                    { key: 'paymentAlerts', label: 'Payment Alerts', desc: 'Earnings and payout notifications' }
                  ].map((pref) => (
                    <div key={pref.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{pref.label}</p>
                        <p className="text-sm text-slate-600">{pref.desc}</p>
                      </div>
                      <button
                        onClick={() => {
                          const newPrefs = {...preferences, [pref.key]: !preferences[pref.key as keyof typeof preferences]}
                          setPreferences(newPrefs)
                          handlePreferencesUpdate()
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          preferences[pref.key as keyof typeof preferences] ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            preferences[pref.key as keyof typeof preferences] ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="mt-6">
            <div className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={securityData.currentPassword}
                        onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={securityData.newPassword}
                      onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={securityData.confirmPassword}
                      onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                    />
                  </div>
                  <Button onClick={handlePasswordChange} className="w-full">
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5" />
                      <div>
                        <p className="font-medium">2FA Protection</p>
                        <p className="text-sm text-slate-600">
                          {securityData.twoFactorEnabled ? 'Enabled' : 'Add an extra layer of security'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant={securityData.twoFactorEnabled ? "destructive" : "default"}
                      onClick={() => setSecurityData({...securityData, twoFactorEnabled: !securityData.twoFactorEnabled})}
                    >
                      {securityData.twoFactorEnabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Connected Apps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Instagram', connected: true, icon: Instagram },
                    { name: 'YouTube', connected: false, icon: Youtube },
                    { name: 'TikTok', connected: true, icon: Globe }
                  ].map((app) => (
                    <div key={app.name} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <app.icon className="w-5 h-5" />
                        <div>
                          <p className="font-medium">{app.name}</p>
                          <p className="text-sm text-slate-600">
                            {app.connected ? 'Connected' : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={app.connected ? "destructive" : "outline"}
                        size="sm"
                      >
                        {app.connected ? 'Disconnect' : 'Connect'}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="mt-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { 
                      id: 1, 
                      title: 'Campaign Approved', 
                      message: 'Your content for Summer Skincare campaign has been approved',
                      time: '2 hours ago',
                      type: 'success'
                    },
                    { 
                      id: 2, 
                      title: 'Payment Processed', 
                      message: '$350 has been sent to your M-Pesa account',
                      time: '1 day ago',
                      type: 'info'
                    },
                    { 
                      id: 3, 
                      title: 'New Campaign Invite', 
                      message: 'NIVEA Kenya invited you to join their new campaign',
                      time: '3 days ago',
                      type: 'warning'
                    }
                  ].map((notification) => (
                    <div key={notification.id} className="flex items-start space-x-3 p-3 border border-slate-200 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'info' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{notification.title}</p>
                        <p className="text-sm text-slate-600">{notification.message}</p>
                        <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Portfolio Management (Influencers Only) */}
          {user?.role === 'INFLUENCER' && (
            <TabsContent value="portfolio" className="mt-6">
              <div className="space-y-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>My Portfolio</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">Automatically generated from your completed campaign work</p>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Auto-Generated
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-6">
                      {portfolio.map((item) => (
                        <div key={item.id} className="border rounded-xl p-6 bg-white/50 shadow-sm hover:shadow-md transition-shadow">
                          {/* Campaign Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              {item.brandLogo && (
                                <img
                                  src={item.brandLogo}
                                  alt={item.brandName}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <h3 className="font-semibold text-slate-900 text-lg">{item.title}</h3>
                                <p className="text-sm text-slate-600">{item.brandName}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge className={`${portfolioManagementService.getPlatformInfo(item.platform).bgColor} ${portfolioManagementService.getPlatformInfo(item.platform).color}`}>
                                    {portfolioManagementService.getPlatformInfo(item.platform).icon} {item.platform}
                                  </Badge>
                                  <Badge variant="outline">{item.contentType}</Badge>
                                  <Badge className={item.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                    {item.status === 'PAID' ? '💰 Paid' : '✅ Completed'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            {item.amount && (
                              <div className="text-right">
                                <p className="text-lg font-bold text-green-600">${item.amount}</p>
                                <p className="text-xs text-slate-500">Earned</p>
                              </div>
                            )}
                          </div>

                          {/* Performance Metrics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 rounded-lg">
                            <div className="text-center">
                              <p className="text-lg font-semibold text-slate-900">{portfolioManagementService.formatNumber(item.totalPerformance.views)}</p>
                              <p className="text-xs text-slate-500">Views</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-semibold text-slate-900">{portfolioManagementService.formatNumber(item.totalPerformance.likes)}</p>
                              <p className="text-xs text-slate-500">Likes</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-semibold text-slate-900">{portfolioManagementService.formatNumber(item.totalPerformance.comments)}</p>
                              <p className="text-xs text-slate-500">Comments</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-semibold text-slate-900">{item.totalPerformance.avgEngagementRate}%</p>
                              <p className="text-xs text-slate-500">Engagement</p>
                            </div>
                          </div>

                          {/* Published Posts */}
                          {item.publishedPosts && item.publishedPosts.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-slate-700 text-sm">Published Content:</h4>
                              {item.publishedPosts.map((post, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-lg">{portfolioManagementService.getPlatformInfo(post.platform).icon}</span>
                                    <div>
                                      <p className="font-medium text-sm text-slate-900">{post.platform} {post.postType}</p>
                                      <p className="text-xs text-slate-500">
                                        {new Date(post.publishedAt).toLocaleDateString()} • 
                                        <span className={`ml-1 ${post.status === 'VERIFIED' ? 'text-green-600' : 'text-yellow-600'}`}>
                                          {post.status === 'VERIFIED' ? '✓ Verified' : '⏳ Pending'}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                                    {post.performance && (
                                      <>
                                        <span>{portfolioManagementService.formatNumber(post.performance.views)} views</span>
                                        <span>{post.performance.engagementRate}% ER</span>
                                      </>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => window.open(post.postUrl, '_blank')}
                                    >
                                      View Post
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Campaign Details */}
                          <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                            <span>Submitted: {new Date(item.submittedAt).toLocaleDateString()}</span>
                            <span>
                              {item.completedAt && `Completed: ${new Date(item.completedAt).toLocaleDateString()}`}
                              {item.paidAt && ` • Paid: ${new Date(item.paidAt).toLocaleDateString()}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {portfolio.length === 0 && (
                      <div className="text-center py-12">
                        <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 mb-2">No Portfolio Items Yet</h3>
                        <p className="text-slate-600 mb-6 max-w-md mx-auto">
                          Your portfolio will automatically populate as you complete campaigns. 
                          Start by applying to campaigns and submitting content!
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button onClick={() => navigate('/campaigns/browse')} className="bg-blue-600 hover:bg-blue-700">
                            Browse Campaigns
                          </Button>
                          <Button variant="outline" onClick={() => navigate('/dashboard/INFLUENCER')}>
                            View Dashboard
                          </Button>
                        </div>
                        
                        <div className="mt-8 p-4 bg-blue-50 rounded-lg max-w-lg mx-auto">
                          <p className="text-sm text-blue-800">
                            <strong>💡 How it works:</strong> Complete campaigns → Submit content → Add live URLs → Portfolio updates automatically with real performance data!
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Info Box about Automatic Portfolio */}
                    {portfolio.length > 0 && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <span className="text-blue-500 text-lg">ℹ️</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-blue-900">Performance Data</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              Performance metrics are currently mocked. Once OAuth integration is complete, 
                              real-time data from Instagram, TikTok, YouTube, and other platforms will be displayed automatically.
                            </p>
                            <p className="text-xs text-blue-600 mt-2">
                              📊 <strong>Coming Soon:</strong> Live views, likes, comments, shares, and engagement rates from your actual posts!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Packages Management (Influencers Only) */}
          {user?.role === 'INFLUENCER' && (
            <TabsContent value="packages" className="mt-6">
              <div className="space-y-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>My Packages & Rates</CardTitle>
                    <Button onClick={() => setShowPackageForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Package
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {packages.map((pkg) => (
                        <div key={pkg.id} className="border rounded-lg p-4 bg-white/50">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-slate-900">{pkg.platform} - {pkg.packageType}</h3>
                              <p className="text-2xl font-bold text-green-600">${pkg.price}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost" onClick={() => handlePackageEdit(pkg)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handlePackageDelete(pkg.id!)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-600 font-medium">Deliverables:</p>
                            {pkg.deliverables.map((item, index) => (
                              <p key={index} className="text-xs text-slate-500">• {item}</p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {packages.length === 0 && (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600 mb-4">No packages configured yet</p>
                        <Button onClick={() => setShowPackageForm(true)}>
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Package
                        </Button>
                      </div>
                    )}
                    
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {/* Logout Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-8 relative z-10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">Sign Out</h3>
                <p className="text-sm text-slate-600">Sign out of your account on this device</p>
              </div>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Package Form Modal - Moved to end for proper z-index */}
      {showPackageForm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowPackageForm(false)
              setEditingPackage(null)
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-[10000]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingPackage ? 'Edit Package' : 'Add Package'}
              </h3>
              <Button variant="ghost" size="sm" onClick={() => {
                setShowPackageForm(false)
                setEditingPackage(null)
              }}>
                ✕
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Platform *</label>
                  <select
                    value={packageForm.platform}
                    onChange={(e) => setPackageForm({...packageForm, platform: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Twitter">Twitter</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Package Type *</label>
                  <select
                    value={packageForm.packageType}
                    onChange={(e) => setPackageForm({...packageForm, packageType: e.target.value})}
                    className="w-full p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Post">Post</option>
                    <option value="Story">Story</option>
                    <option value="Reel">Reel</option>
                    <option value="Video">Video</option>
                    <option value="Campaign">Full Campaign</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Package Title</label>
                <Input
                  value={packageForm.title}
                  onChange={(e) => setPackageForm({...packageForm, title: e.target.value})}
                  placeholder="e.g., Instagram Post Package"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({...packageForm, description: e.target.value})}
                  className="w-full h-20 p-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe what's included in this package"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Price (USD) *
                  </label>
                  <Input
                    value={packageForm.price}
                    onChange={(e) => setPackageForm({...packageForm, price: Number(e.target.value) || 0})}
                    type="number"
                    placeholder="100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Turnaround (Days)</label>
                  <Input
                    value={packageForm.turnaroundDays}
                    onChange={(e) => setPackageForm({...packageForm, turnaroundDays: Number(e.target.value) || 1})}
                    type="number"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Revisions</label>
                  <Input
                    value={packageForm.revisions}
                    onChange={(e) => setPackageForm({...packageForm, revisions: Number(e.target.value) || 1})}
                    type="number"
                    placeholder="1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Deliverables</label>
                <div className="space-y-2">
                  {packageForm.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={deliverable}
                        onChange={(e) => {
                          const newDeliverables = [...packageForm.deliverables]
                          newDeliverables[index] = e.target.value
                          setPackageForm({...packageForm, deliverables: newDeliverables})
                        }}
                        placeholder="e.g., 1 Instagram post with your product"
                      />
                      {packageForm.deliverables.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newDeliverables = packageForm.deliverables.filter((_, i) => i !== index)
                            setPackageForm({...packageForm, deliverables: newDeliverables})
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPackageForm({...packageForm, deliverables: [...packageForm.deliverables, '']})
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Deliverable
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={packageForm.isActive}
                    onChange={(e) => setPackageForm({...packageForm, isActive: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                    Active Package (visible to brands)
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => {
                  setShowPackageForm(false)
                  setEditingPackage(null)
                }}>
                  Cancel
                </Button>
                <Button onClick={handlePackageSubmit}>
                  {editingPackage ? 'Update' : 'Create'} Package
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
