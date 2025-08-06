import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Settings, User, LogOut } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import NotificationSystem from '../notifications/NotificationSystem'

interface HeaderProps {
  userRole: 'brand' | 'influencer'
  userName: string
  userAvatar: string
}

export default function Header({ userRole, userName, userAvatar }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/discover')) return 'Discover Influencers'
    if (path.includes('/campaigns')) return 'Campaigns'
    if (path.includes('/analytics')) return 'Analytics'
    if (path.includes('/settings')) return 'Settings'
    if (path.includes('/dashboard')) return userRole === 'brand' ? 'Brand Dashboard' : 'Creator Dashboard'
    return 'Influmeter'
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left: Logo & Page Title */}
        <div className="flex items-center space-x-6">
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate(`/dashboard/${userRole}`)}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">I</span>
            </div>
            <span className="font-bold text-xl text-slate-900 hidden sm:block">Influmeter</span>
          </div>
          
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-slate-900">{getPageTitle()}</h1>
          </div>
        </div>

        {/* Center: Search (on larger screens) */}
        <div className="hidden lg:block flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder={userRole === 'brand' ? 'Search influencers...' : 'Search campaigns...'}
              className="pl-10 bg-slate-50 border-slate-200"
            />
          </div>
        </div>

        {/* Right: Notifications & User Menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationSystem userRole={userRole} />

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <img 
              src={userAvatar} 
              alt={userName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{userName}</p>
              <p className="text-xs text-slate-600 capitalize">{userRole}</p>
            </div>

            {/* Settings Dropdown */}
            <div className="relative group">
              <Button variant="ghost" size="sm" className="p-2">
                <Settings className="w-4 h-4 text-slate-600" />
              </Button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <button 
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => navigate('/settings/profile')}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </button>
                  <button 
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Preferences</span>
                  </button>
                  <hr className="my-2" />
                  <button 
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={() => navigate('/login')}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
