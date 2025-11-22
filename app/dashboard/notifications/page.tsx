'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, X, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải thông báo')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật thông báo')
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read)
      await Promise.all(
        unreadNotifications.map(n => 
          fetch(`/api/notifications/${n.id}/read`, { method: 'PATCH' })
        )
      )
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
      setUnreadCount(0)
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc')
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật thông báo')
    }
  }

  const getNotificationIcon = (title: string) => {
    if (title.includes('duyệt') || title.includes('thành công')) {
      return Check
    } else if (title.includes('từ chối') || title.includes('lỗi')) {
      return X
    } else if (title.includes('chờ')) {
      return Clock
    } else {
      return AlertCircle
    }
  }

  const getNotificationColor = (title: string) => {
    if (title.includes('duyệt') || title.includes('thành công')) {
      return 'text-green-600 bg-green-100'
    } else if (title.includes('từ chối') || title.includes('lỗi')) {
      return 'text-red-600 bg-red-100'
    } else if (title.includes('chờ')) {
      return 'text-yellow-600 bg-yellow-100'
    } else {
      return 'text-blue-600 bg-blue-100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
          <p className="mt-2 text-sm text-gray-700">
            Quản lý thông báo và cập nhật từ hệ thống
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              onClick={markAllAsRead}
              className="btn btn-secondary inline-flex items-center"
            >
              <Check className="h-4 w-4 mr-2" />
              Đánh dấu tất cả đã đọc
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-blue-100">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Tổng thông báo
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Chưa đọc
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {unreadCount}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Đã đọc
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.length - unreadCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="mt-8 space-y-4">
        {notifications.map((notification) => {
          const Icon = getNotificationIcon(notification.title)
          return (
            <div 
              key={notification.id} 
              className={`card ${!notification.read ? 'border-l-4 border-l-primary-500 bg-primary-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-lg ${getNotificationColor(notification.title)}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-lg font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có thông báo nào</h3>
          <p className="mt-1 text-sm text-gray-500">
            Bạn chưa có thông báo nào từ hệ thống.
          </p>
        </div>
      )}
    </div>
  )
}
