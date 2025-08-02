import React, { useState } from 'react'
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
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { useAppSelector, useAppDispatch } from '../../hooks/redux'
import { logoutUser } from '../../store/slices/authSlice'

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
    bio: user?.bio || '',
    phone: user?.phone || '',
    website: user?.website || '',
    socialLinks: {
      instagram: user?.socialLinks?.instagram || '',
      youtube: user?.socialLinks?.youtube || '',
      twitter: user?.socialLinks?.twitter || '',
      tiktok: user?.socialLinks?.tiktok || ''
    }
  })

  // Security state
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: user?.twoFactorEnabled || false
  })

  // Preferences state
  const [preferences, setPreferences] = useState({
    darkMode: localStorage.getItem('theme') === 'dark',
    emailNotifications: user?.preferences?.emailNotifications || true,
    pushNotifications: user?.preferences?.pushNotifications || true,
    campaignUpdates: user?.preferences?.campaignUpdates || true,
    paymentAlerts: user?.preferences?.paymentAlerts || true
  })

  const handleProfileUpdate = async () => {
    // Simulate API call
    console.log('Updating profile:', profileData)
    setIsEditing(false)
    // Show success notification
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
          <TabsList className="grid w-full grid-cols-4">
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
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="mt-6">
            <div className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => isEditing ? handleProfileUpdate() : setIsEditing(true)}
                  >
                    {isEditing ? 'Save Changes' : 'Edit Profile'}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={user?.avatar || '/api/placeholder/80/80'}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      {isEditing && (
                        <button className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                          <Camera className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{user?.name}</h3>
                      <p className="text-sm text-slate-600 capitalize">{user?.role}</p>
                      {user?.verified && (
                        <Badge className="mt-1 bg-blue-100 text-blue-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Basic Info */}
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

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                      disabled={!isEditing}
                      className="w-full h-24 p-3 border border-slate-200 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-slate-50"
                      maxLength={500}
                    />
                    <p className="text-xs text-slate-500 mt-1">{profileData.bio.length}/500 characters</p>
                  </div>

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
        </Tabs>

        {/* Logout Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm mt-8">
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
    </div>
  )
}
