'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, MapPin, Building, Users, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

interface CulturalCenter {
  id: string
  name: string
  description: string | null
  capacity: number
  location: string
  building: string
  floor: number | null
  room: string | null
  amenities: string | null
  createdAt: string
  _count: {
    bookings: number
  }
}

const BUILDINGS = [
  { id: 'A', name: 'Tòa nhà A', color: 'bg-blue-500' },
  { id: 'B', name: 'Tòa nhà B', color: 'bg-green-500' },
  { id: 'C', name: 'Tòa nhà C', color: 'bg-purple-500' }
]

export default function CulturalCentersPage() {
  const [centers, setCenters] = useState<CulturalCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingCenter, setEditingCenter] = useState<CulturalCenter | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: '',
    location: '',
    building: 'A',
    floor: '',
    room: '',
    amenities: ''
  })

  useEffect(() => {
    fetchCenters()
  }, [])

  const fetchCenters = async () => {
    try {
      const response = await fetch('/api/cultural-centers')
      if (response.ok) {
        const data = await response.json()
        setCenters(data)
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải danh sách nhà văn hóa')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.capacity) {
      toast.error('Tên và sức chứa là bắt buộc')
      return
    }

    try {
      const url = editingCenter ? `/api/cultural-centers/${editingCenter.id}` : '/api/cultural-centers'
      const method = editingCenter ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
          floor: formData.floor ? parseInt(formData.floor) : null,
          amenities: formData.amenities ? formData.amenities.split(',').map(a => a.trim()) : []
        }),
      })

      if (response.ok) {
        toast.success(editingCenter ? 'Cập nhật nhà văn hóa thành công!' : 'Thêm nhà văn hóa thành công!')
        setShowModal(false)
        setEditingCenter(null)
        setFormData({
          name: '',
          description: '',
          capacity: '',
          location: '',
          building: 'A',
          floor: '',
          room: '',
          amenities: ''
        })
        fetchCenters()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleEdit = (center: CulturalCenter) => {
    setEditingCenter(center)
    setFormData({
      name: center.name,
      description: center.description || '',
      capacity: center.capacity.toString(),
      location: center.location,
      building: center.building,
      floor: center.floor?.toString() || '',
      room: center.room || '',
      amenities: center.amenities ? JSON.parse(center.amenities).join(', ') : ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhà văn hóa này?')) return

    try {
      const response = await fetch(`/api/cultural-centers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Xóa nhà văn hóa thành công!')
        fetchCenters()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Có lỗi xảy ra khi xóa nhà văn hóa')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa nhà văn hóa')
    }
  }

  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (center.description && center.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      center.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesBuilding = selectedBuilding === 'all' || center.building === selectedBuilding
    
    return matchesSearch && matchesBuilding
  })

  const getBuildingStats = (buildingId: string) => {
    const buildingCenters = centers.filter(c => c.building === buildingId)
    const totalCapacity = buildingCenters.reduce((sum, c) => sum + c.capacity, 0)
    const totalBookings = buildingCenters.reduce((sum, c) => sum + c._count.bookings, 0)
    
    return {
      centers: buildingCenters.length,
      totalCapacity,
      totalBookings
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nhà văn hóa</h1>
          <p className="mt-2 text-sm text-gray-700">
            Quản lý thông tin các nhà văn hóa với 3 tòa nhà
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => {
              setEditingCenter(null)
              setFormData({
                name: '',
                description: '',
                capacity: '',
                location: '',
                building: 'A',
                floor: '',
                room: '',
                amenities: ''
              })
              setShowModal(true)
            }}
            className="btn btn-primary inline-flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm nhà văn hóa
          </button>
        </div>
      </div>

      {/* Building Overview */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {BUILDINGS.map((building) => {
          const stats = getBuildingStats(building.id)
          return (
            <div key={building.id} className="card">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${building.color}`}>
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {building.name}
                  </h3>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Phòng</p>
                      <p className="font-medium">{stats.centers}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Sức chứa</p>
                      <p className="font-medium">{stats.totalCapacity}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Lịch đặt</p>
                      <p className="font-medium">{stats.totalBookings}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, mô tả hoặc địa điểm..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            className="input"
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
          >
            <option value="all">Tất cả tòa nhà</option>
            {BUILDINGS.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Centers Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCenters.map((center) => (
          <div key={center.id} className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${BUILDINGS.find(b => b.id === center.building)?.color || 'bg-gray-500'}`}>
                  <Building className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {center.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Tòa {center.building} - Tầng {center.floor || 'N/A'}
                    {center.room && ` - Phòng ${center.room}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(center)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(center.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {center.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">{center.description}</p>
              </div>
            )}
            
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-500">Sức chứa:</span>
                <span className="ml-1 font-medium">{center.capacity}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-500">Lịch đặt:</span>
                <span className="ml-1 font-medium">{center._count.bookings}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-500">{center.location}</span>
              </div>
            </div>
            
            {center.amenities && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Tiện nghi:</p>
                <div className="flex flex-wrap gap-1">
                  {JSON.parse(center.amenities).map((amenity: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCenters.length === 0 && (
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có nhà văn hóa nào</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedBuilding !== 'all' 
              ? 'Không tìm thấy nhà văn hóa phù hợp với bộ lọc.' 
              : 'Bắt đầu bằng cách thêm nhà văn hóa đầu tiên.'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingCenter ? 'Chỉnh sửa nhà văn hóa' : 'Thêm nhà văn hóa mới'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tên nhà văn hóa *
                      </label>
                      <input
                        type="text"
                        required
                        className="mt-1 input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nhập tên nhà văn hóa"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Mô tả
                      </label>
                      <textarea
                        className="mt-1 input"
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Nhập mô tả nhà văn hóa"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Sức chứa *
                        </label>
                        <input
                          type="number"
                          required
                          className="mt-1 input"
                          value={formData.capacity}
                          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                          placeholder="Số người"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tòa nhà *
                        </label>
                        <select
                          required
                          className="mt-1 input"
                          value={formData.building}
                          onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                        >
                          {BUILDINGS.map((building) => (
                            <option key={building.id} value={building.id}>
                              {building.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Tầng
                        </label>
                        <input
                          type="number"
                          className="mt-1 input"
                          value={formData.floor}
                          onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                          placeholder="Số tầng"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phòng
                        </label>
                        <input
                          type="text"
                          className="mt-1 input"
                          value={formData.room}
                          onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                          placeholder="Số phòng"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Địa điểm
                      </label>
                      <input
                        type="text"
                        className="mt-1 input"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Địa điểm cụ thể"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tiện nghi (phân cách bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        className="mt-1 input"
                        value={formData.amenities}
                        onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                        placeholder="Ví dụ: Máy chiếu, Âm thanh, Điều hòa"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn btn-primary sm:ml-3"
                  >
                    {editingCenter ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn btn-secondary mt-3 sm:mt-0"
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
