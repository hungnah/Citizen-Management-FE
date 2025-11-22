'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, Clock, Building, Users, Filter, Edit, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Activity {
  id: string
  title: string
  description: string | null
  type: string
  clubType: string | null
  startTime: string
  endTime: string
  location: string | null
  status: string
  culturalCenter: {
    id: string
    name: string
    building: string
  } | null
  creator: {
    id: string
    name: string
  }
}

interface CulturalCenter {
  id: string
  name: string
  building: string
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [centers, setCenters] = useState<CulturalCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [userRole, setUserRole] = useState<string>('USER')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'MEETING',
    clubType: '',
    startTime: '',
    endTime: '',
    location: '',
    culturalCenterId: ''
  })

  useEffect(() => {
    fetchUserRole()
    fetchActivities()
    fetchCenters()
  }, [selectedType])

  const fetchUserRole = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const user = await response.json()
        setUserRole(user.role)
      }
    } catch (error) {
      console.error('Error fetching user role:', error)
    }
  }

  const fetchActivities = async () => {
    try {
      const params = selectedType !== 'all' ? `?type=${selectedType}` : ''
      const response = await fetch(`/api/activities${params}`)
      if (response.ok) {
        const data = await response.json()
        setActivities(data)
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải danh sách lịch hoạt động')
    } finally {
      setLoading(false)
    }
  }

  const fetchCenters = async () => {
    try {
      const response = await fetch('/api/cultural-centers')
      if (response.ok) {
        const data = await response.json()
        setCenters(data)
      }
    } catch (error) {
      console.error('Error fetching centers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.startTime || !formData.endTime) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    const startTime = new Date(formData.startTime)
    const endTime = new Date(formData.endTime)

    if (startTime >= endTime) {
      toast.error('Thời gian kết thúc phải sau thời gian bắt đầu')
      return
    }

    try {
      const url = editingActivity ? `/api/activities/${editingActivity.id}` : '/api/activities'
      const method = editingActivity ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          culturalCenterId: formData.culturalCenterId || null
        })
      })

      if (response.ok) {
        toast.success(editingActivity ? 'Cập nhật thành công!' : 'Tạo thành công!')
        setShowModal(false)
        setEditingActivity(null)
        setFormData({
          title: '',
          description: '',
          type: 'MEETING',
          clubType: '',
          startTime: '',
          endTime: '',
          location: '',
          culturalCenterId: ''
        })
        fetchActivities()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa lịch hoạt động này?')) return

    try {
      const response = await fetch(`/api/activities/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Xóa thành công!')
        fetchActivities()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity)
    setFormData({
      title: activity.title,
      description: activity.description || '',
      type: activity.type,
      clubType: activity.clubType || '',
      startTime: activity.startTime.split('T')[0] + 'T' + activity.startTime.split('T')[1].substring(0, 5),
      endTime: activity.endTime.split('T')[0] + 'T' + activity.endTime.split('T')[1].substring(0, 5),
      location: activity.location || '',
      culturalCenterId: activity.culturalCenter?.id || ''
    })
    setShowModal(true)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'MEETING': return 'Họp tổ dân phố/Chi bộ'
      case 'CLUB': return 'Sinh hoạt CLB'
      case 'RENTAL': return 'Cho thuê'
      default: return type
    }
  }

  const filteredActivities = activities.filter(a => 
    selectedType === 'all' || a.type === selectedType
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Lịch hoạt động</h1>
          <p className="mt-2 text-sm text-gray-700">
            Quản lý lịch họp tổ dân phố, sinh hoạt CLB và cho thuê
          </p>
        </div>
        {userRole === 'ADMIN' && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => {
                setEditingActivity(null)
                setFormData({
                  title: '',
                  description: '',
                  type: 'MEETING',
                  clubType: '',
                  startTime: '',
                  endTime: '',
                  location: '',
                  culturalCenterId: ''
                })
                setShowModal(true)
              }}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Thêm lịch hoạt động
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="mt-8 flex gap-4">
        <div className="sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Loại hoạt động
          </label>
          <select
            className="input"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">Tất cả</option>
            <option value="MEETING">Họp tổ dân phố/Chi bộ</option>
            <option value="CLUB">Sinh hoạt CLB</option>
            <option value="RENTAL">Cho thuê</option>
          </select>
        </div>
      </div>

      {/* Activities List */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{activity.title}</h3>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    activity.type === 'MEETING' ? 'bg-blue-100 text-blue-800' :
                    activity.type === 'CLUB' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {getTypeLabel(activity.type)}
                  </span>
                  {activity.clubType && (
                    <span className="ml-2 text-xs text-gray-600">({activity.clubType})</span>
                  )}
                </div>
                <div className="mt-3 space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {new Date(activity.startTime).toLocaleString('vi-VN')} - {new Date(activity.endTime).toLocaleString('vi-VN')}
                  </div>
                  {activity.culturalCenter && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="h-4 w-4 mr-2" />
                      {activity.culturalCenter.name} ({activity.culturalCenter.building})
                    </div>
                  )}
                  {activity.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">📍</span>
                      {activity.location}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {activity.creator.name}
                  </div>
                </div>
                {activity.description && (
                  <p className="mt-2 text-sm text-gray-500">{activity.description}</p>
                )}
              </div>
              {userRole === 'ADMIN' && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(activity)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(activity.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredActivities.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có lịch hoạt động</h3>
          <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách tạo lịch hoạt động mới.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && userRole === 'ADMIN' && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingActivity ? 'Chỉnh sửa lịch hoạt động' : 'Thêm lịch hoạt động'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tiêu đề *</label>
                      <input
                        type="text"
                        className="input mt-1"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Loại hoạt động *</label>
                      <select
                        className="input mt-1"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        required
                      >
                        <option value="MEETING">Họp tổ dân phố/Chi bộ</option>
                        <option value="CLUB">Sinh hoạt CLB</option>
                        <option value="RENTAL">Cho thuê</option>
                      </select>
                    </div>
                    {formData.type === 'CLUB' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Loại CLB</label>
                        <input
                          type="text"
                          className="input mt-1"
                          placeholder="VD: Thơ, dưỡng sinh, bóng bàn"
                          value={formData.clubType}
                          onChange={(e) => setFormData({ ...formData, clubType: e.target.value })}
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Thời gian bắt đầu *</label>
                      <input
                        type="datetime-local"
                        className="input mt-1"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Thời gian kết thúc *</label>
                      <input
                        type="datetime-local"
                        className="input mt-1"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nhà văn hóa (tùy chọn)</label>
                      <select
                        className="input mt-1"
                        value={formData.culturalCenterId}
                        onChange={(e) => setFormData({ ...formData, culturalCenterId: e.target.value })}
                      >
                        <option value="">Không sử dụng nhà văn hóa</option>
                        {centers.map((center) => (
                          <option key={center.id} value={center.id}>
                            {center.name} ({center.building})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Địa điểm (nếu không dùng nhà văn hóa)</label>
                      <input
                        type="text"
                        className="input mt-1"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                      <textarea
                        className="input mt-1"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn-primary w-full sm:ml-3 sm:w-auto">
                    {editingActivity ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary mt-3 w-full sm:mt-0 sm:w-auto"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

