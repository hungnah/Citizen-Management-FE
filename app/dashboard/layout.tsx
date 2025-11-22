'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  Users, 
  Building, 
  Calendar, 
  FileText, 
  Settings,
  LogOut,
  Menu,
  X,
  Bell
} from 'lucide-react'
import toast from 'react-hot-toast'

interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'USER'
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState(0)
  const router = useRouter()

  useEffect(() => {
    // Get user info from API
    const fetchUser = async () => {
      try {
        console.log('Fetching user info...')
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const userData = await response.json()
          console.log('User data received:', userData)
          setUser(userData)
        } else {
          console.log('Failed to get user info, redirecting to login')
          router.push('/login')
        }
      } catch (error) {
        console.log('Error fetching user info:', error)
        router.push('/login')
      }
    }

    fetchUser()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast.success('Đăng xuất thành công!')
      router.push('/')
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng xuất!')
    }
  }

  const navigation = user?.role === 'ADMIN' ? [
    { name: 'Tổng quan', href: '/dashboard', icon: Home },
    { name: 'Quản lý hộ khẩu', href: '/dashboard/households', icon: Users },
    { name: 'Quản lý nhân khẩu', href: '/dashboard/persons', icon: Users },
    { name: 'Khu phố', href: '/dashboard/districts', icon: Building },
    { name: 'Nhà văn hóa', href: '/dashboard/cultural-centers', icon: Building },
    { name: 'Lịch hoạt động', href: '/dashboard/activities', icon: Calendar },
    { name: 'Tài sản', href: '/dashboard/assets', icon: Building },
    { name: 'Yêu cầu', href: '/dashboard/requests', icon: FileText },
    { name: 'Đặt lịch', href: '/dashboard/bookings', icon: Calendar },
    { name: 'Lịch trống', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Cài đặt', href: '/dashboard/settings', icon: Settings },
  ] : [
    { name: 'Tổng quan', href: '/dashboard', icon: Home },
    { name: 'Hộ khẩu của tôi', href: '/dashboard/my-household', icon: Users },
    { name: 'Yêu cầu', href: '/dashboard/my-requests', icon: FileText },
    { name: 'Nhà văn hóa', href: '/dashboard/cultural-centers', icon: Building },
    { name: 'Lịch hoạt động', href: '/dashboard/activities', icon: Calendar },
    { name: 'Tài sản', href: '/dashboard/assets', icon: Building },
    { name: 'Đặt lịch', href: '/dashboard/bookings', icon: Calendar },
    { name: 'Lịch trống', href: '/dashboard/calendar', icon: Calendar },
    { name: 'Cài đặt', href: '/dashboard/settings', icon: Settings },
  ]

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Building className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Quản lý nhân khẩu</span>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="nav-link group flex items-center px-2 py-2 text-base font-medium rounded-md"
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 sidebar">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <Building className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Quản lý nhân khẩu</span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="nav-link group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role === 'ADMIN' ? 'Quản trị viên' : 'Người dùng'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                    <span className="text-sm text-gray-500">Chào mừng, {user.name}!</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button
                type="button"
                className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Bell className="h-6 w-6" />
                {notifications > 0 && (
                  <span className="absolute -mt-1 -mr-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="ml-3 bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
