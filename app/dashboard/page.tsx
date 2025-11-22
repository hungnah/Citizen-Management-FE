'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Building, FileText, Calendar, TrendingUp, AlertCircle, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface DashboardStats {
  totalHouseholds: number
  totalPersons: number
  totalDistricts: number
  totalRequests: number
  pendingRequests: number
  approvedRequests: number
  rejectedRequests: number
  totalBookings: number
  activeBookings: number
  pendingBookings: number
  approvedBookings: number
  rejectedBookings: number
  totalCulturalCenters: number
  recentActivity?: Array<{
    id: string
    action: string
    entity: string
    createdAt: string
    user: {
      name: string
      email: string
    }
  }>
  yesterdayStats?: {
    totalHouseholds: number
    totalPersons: number
    totalBookings: number
    activeBookings: number
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalHouseholds: 0,
    totalPersons: 0,
    totalDistricts: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalBookings: 0,
    activeBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    rejectedBookings: 0,
    totalCulturalCenters: 0
  })
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchStats()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/sync', {
        method: 'POST'
      })
      if (response.ok) {
        toast.success('Đồng bộ thành công!')
        await fetchStats()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Có lỗi xảy ra khi đồng bộ')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đồng bộ')
    } finally {
      setSyncing(false)
    }
  }

  const calculateChange = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change).toFixed(1),
      type: change >= 0 ? 'positive' : 'negative'
    }
  }

  const householdChange = calculateChange(stats.totalHouseholds, stats.yesterdayStats?.totalHouseholds)
  const personChange = calculateChange(stats.totalPersons, stats.yesterdayStats?.totalPersons)
  const bookingChange = calculateChange(stats.totalBookings, stats.yesterdayStats?.totalBookings)
  const activeBookingChange = calculateChange(stats.activeBookings, stats.yesterdayStats?.activeBookings)

  const statCards = [
    {
      name: 'Tổng số hộ khẩu',
      value: stats.totalHouseholds,
      icon: Users,
      color: 'bg-blue-500',
      change: householdChange ? `${householdChange.type === 'positive' ? '+' : '-'}${householdChange.value}%` : null,
      changeType: householdChange?.type || 'positive'
    },
    {
      name: 'Tổng số nhân khẩu',
      value: stats.totalPersons,
      icon: Users,
      color: 'bg-green-500',
      change: personChange ? `${personChange.type === 'positive' ? '+' : '-'}${personChange.value}%` : null,
      changeType: personChange?.type || 'positive'
    },
    {
      name: 'Số khu phố',
      value: stats.totalDistricts,
      icon: Building,
      color: 'bg-purple-500',
      change: null,
      changeType: 'positive'
    },
    {
      name: 'Yêu cầu chờ duyệt',
      value: stats.pendingRequests,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      change: null,
      changeType: 'negative'
    },
    {
      name: 'Lịch đặt đang hoạt động',
      value: stats.activeBookings,
      icon: Calendar,
      color: 'bg-green-500',
      change: activeBookingChange ? `${activeBookingChange.type === 'positive' ? '+' : '-'}${activeBookingChange.value}%` : null,
      changeType: activeBookingChange?.type || 'positive'
    },
    {
      name: 'Tổng số lịch đặt',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'bg-pink-500',
      change: bookingChange ? `${bookingChange.type === 'positive' ? '+' : '-'}${bookingChange.value}%` : null,
      changeType: bookingChange?.type || 'positive'
    },
    {
      name: 'Lịch đặt chờ duyệt',
      value: stats.pendingBookings,
      icon: Clock,
      color: 'bg-yellow-500',
      change: null,
      changeType: 'negative'
    },
    {
      name: 'Nhà văn hóa',
      value: stats.totalCulturalCenters,
      icon: Building,
      color: 'bg-indigo-500',
      change: null,
      changeType: 'positive'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan hệ thống</h1>
          <p className="mt-1 text-sm text-gray-500">
            Thống kê tổng quan về hệ thống quản lý nhân khẩu và nhà văn hóa
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn btn-primary flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Đang đồng bộ...' : 'Đồng bộ dữ liệu'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-md ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {card.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {card.value.toLocaleString()}
                    </div>
                    {card.change && (
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className="self-center flex-shrink-0 h-4 w-4" />
                        <span className="sr-only">
                          {card.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                        </span>
                        {card.change}
                      </div>
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Hoạt động gần đây
            </h3>
            <div className="space-y-3">
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => {
                  const getActionIcon = () => {
                    switch (activity.action) {
                      case 'APPROVED':
                        return <CheckCircle className="h-5 w-5 text-green-500" />
                      case 'REJECTED':
                        return <XCircle className="h-5 w-5 text-red-500" />
                      case 'CREATE':
                        return <FileText className="h-5 w-5 text-blue-500" />
                      case 'UPDATE':
                        return <RefreshCw className="h-5 w-5 text-yellow-500" />
                      default:
                        return <FileText className="h-5 w-5 text-gray-400" />
                    }
                  }

                  const getActionText = () => {
                    switch (activity.action) {
                      case 'APPROVED':
                        return 'Đã duyệt'
                      case 'REJECTED':
                        return 'Đã từ chối'
                      case 'CREATE':
                        return 'Đã tạo'
                      case 'UPDATE':
                        return 'Đã cập nhật'
                      case 'DELETE':
                        return 'Đã xóa'
                      default:
                        return activity.action
                    }
                  }

                  const timeAgo = new Date(activity.createdAt).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })

                  return (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getActionIcon()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {getActionText()} {activity.entity}
                          </p>
                          <p className="text-sm text-gray-500">
                            {activity.user.name} - {timeAgo}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.action === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        activity.action === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getActionText()}
                      </span>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Chưa có hoạt động nào</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Thao tác nhanh
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-primary-600" />
                  <span className="ml-3 text-sm font-medium text-primary-900">
                    Thêm hộ khẩu mới
                  </span>
                </div>
                <span className="text-primary-600">→</span>
              </button>
              
              <button className="w-full flex items-center justify-between p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-primary-600" />
                  <span className="ml-3 text-sm font-medium text-primary-900">
                    Quản lý nhà văn hóa
                  </span>
                </div>
                <span className="text-primary-600">→</span>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/requests')}
                className="w-full flex items-center justify-between p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <span className="ml-3 text-sm font-medium text-primary-900">
                    Xem yêu cầu chờ duyệt ({stats.pendingRequests})
                  </span>
                </div>
                <span className="text-primary-600">→</span>
              </button>
              
              <button 
                onClick={() => router.push('/dashboard/bookings')}
                className="w-full flex items-center justify-between p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
              >
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  <span className="ml-3 text-sm font-medium text-primary-900">
                    Xem lịch đặt chờ duyệt ({stats.pendingBookings})
                  </span>
                </div>
                <span className="text-primary-600">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
