'use client'

import { useState, useEffect } from 'react'
import { Plus, Package, Search, Filter, Edit, Trash2, X, CheckCircle, XCircle, AlertCircle, Wrench, ArrowRight, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

interface Asset {
  id: string
  name: string
  category: string
  description: string | null
  quantity: number
  available: number
  status: string
  location: string | null
  notes: string | null
  borrowedQuantity?: number
  availableQuantity?: number
}

interface BorrowLog {
  id: string
  asset: {
    id: string
    name: string
    category: string
  }
  borrower: {
    id: string
    name: string
    email: string
  }
  booking: {
    id: string
    title: string
  } | null
  quantity: number
  borrowedAt: string
  returnedAt: string | null
  status: string
  conditionBefore: string | null
  conditionAfter: string | null
  notes: string | null
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [borrowLogs, setBorrowLogs] = useState<BorrowLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [selectedBorrowLog, setSelectedBorrowLog] = useState<BorrowLog | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [userRole, setUserRole] = useState<string>('USER')
  const [activeTab, setActiveTab] = useState<'assets' | 'logs'>('assets')
  const [formData, setFormData] = useState({
    name: '',
    category: 'FURNITURE',
    description: '',
    quantity: 1,
    status: 'GOOD',
    location: '',
    notes: ''
  })
  const [borrowFormData, setBorrowFormData] = useState({
    quantity: 1,
    conditionBefore: '',
    notes: ''
  })
  const [returnFormData, setReturnFormData] = useState({
    conditionAfter: '',
    notes: ''
  })

  useEffect(() => {
    fetchUserRole()
    fetchAssets()
    fetchBorrowLogs()
  }, [selectedCategory, selectedStatus, searchTerm])

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

  const fetchAssets = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/assets?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAssets(data)
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải danh sách tài sản')
    } finally {
      setLoading(false)
    }
  }

  const fetchBorrowLogs = async () => {
    try {
      const response = await fetch('/api/assets/borrow-logs')
      if (response.ok) {
        const data = await response.json()
        setBorrowLogs(data)
      }
    } catch (error) {
      console.error('Error fetching borrow logs:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Tên tài sản là bắt buộc')
      return
    }

    try {
      const url = editingAsset ? `/api/assets/${editingAsset.id}` : '/api/assets'
      const method = editingAsset ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success(editingAsset ? 'Cập nhật thành công!' : 'Tạo thành công!')
        setShowModal(false)
        setEditingAsset(null)
        resetForm()
        fetchAssets()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAsset || borrowFormData.quantity <= 0) {
      toast.error('Vui lòng nhập số lượng hợp lệ')
      return
    }

    try {
      const response = await fetch('/api/assets/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: selectedAsset.id,
          quantity: borrowFormData.quantity,
          conditionBefore: borrowFormData.conditionBefore || null,
          notes: borrowFormData.notes || null
        })
      })

      if (response.ok) {
        toast.success('Mượn tài sản thành công!')
        setShowBorrowModal(false)
        setSelectedAsset(null)
        setBorrowFormData({ quantity: 1, conditionBefore: '', notes: '' })
        fetchAssets()
        fetchBorrowLogs()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBorrowLog) {
      toast.error('Không tìm thấy nhật ký mượn')
      return
    }

    try {
      const response = await fetch('/api/assets/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          borrowLogId: selectedBorrowLog.id,
          conditionAfter: returnFormData.conditionAfter || null,
          notes: returnFormData.notes || null
        })
      })

      if (response.ok) {
        toast.success('Trả tài sản thành công!')
        setShowReturnModal(false)
        setSelectedBorrowLog(null)
        setReturnFormData({ conditionAfter: '', notes: '' })
        fetchAssets()
        fetchBorrowLogs()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa tài sản này?')) return

    try {
      const response = await fetch(`/api/assets/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Xóa thành công!')
        fetchAssets()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset)
    setFormData({
      name: asset.name,
      category: asset.category,
      description: asset.description || '',
      quantity: asset.quantity,
      status: asset.status,
      location: asset.location || '',
      notes: asset.notes || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'FURNITURE',
      description: '',
      quantity: 1,
      status: 'GOOD',
      location: '',
      notes: ''
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'GOOD': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'BROKEN': return <XCircle className="h-5 w-5 text-red-500" />
      case 'MAINTENANCE': return <Wrench className="h-5 w-5 text-yellow-500" />
      case 'LIQUIDATION': return <AlertCircle className="h-5 w-5 text-gray-500" />
      default: return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'GOOD': return 'Tốt'
      case 'BROKEN': return 'Đang hỏng'
      case 'MAINTENANCE': return 'Đang bảo trì'
      case 'LIQUIDATION': return 'Cần thanh lý'
      default: return status
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'FURNITURE': return 'Bàn ghế'
      case 'AUDIO': return 'Loa đài'
      case 'ELECTRIC': return 'Quạt'
      case 'TENT': return 'Phông bạt'
      case 'SPORTS': return 'Dụng cụ thể thao'
      default: return category
    }
  }

  const filteredAssets = assets

  const activeBorrowLogs = borrowLogs.filter(log => log.status === 'BORROWED')
  const returnedLogs = borrowLogs.filter(log => log.status === 'RETURNED')
  const damagedLogs = borrowLogs.filter(log => log.status === 'DAMAGED')

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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tài sản</h1>
          <p className="mt-2 text-sm text-gray-700">
            Quản lý cơ sở vật chất và nhật ký mượn/trả
          </p>
        </div>
        {userRole === 'ADMIN' && (
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => {
                setEditingAsset(null)
                resetForm()
                setShowModal(true)
              }}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Thêm tài sản
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('assets')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assets'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Package className="h-5 w-5 inline mr-2" />
            Tài sản ({assets.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ArrowRight className="h-5 w-5 inline mr-2" />
            Nhật ký mượn/trả ({borrowLogs.length})
          </button>
        </nav>
      </div>

      {activeTab === 'assets' && (
        <>
          {/* Filters */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tài sản..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                className="input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                <option value="FURNITURE">Bàn ghế</option>
                <option value="AUDIO">Loa đài</option>
                <option value="ELECTRIC">Quạt</option>
                <option value="TENT">Phông bạt</option>
                <option value="SPORTS">Dụng cụ thể thao</option>
              </select>
            </div>
            <div className="sm:w-48">
              <select
                className="input"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="GOOD">Tốt</option>
                <option value="BROKEN">Đang hỏng</option>
                <option value="MAINTENANCE">Đang bảo trì</option>
                <option value="LIQUIDATION">Cần thanh lý</option>
              </select>
            </div>
          </div>

          {/* Assets Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      {getStatusIcon(asset.status)}
                      <h3 className="ml-2 text-lg font-medium text-gray-900">{asset.name}</h3>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Danh mục:</span> {getCategoryLabel(asset.category)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Trạng thái:</span> {getStatusLabel(asset.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Tổng số:</span> {asset.quantity}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Có sẵn:</span> {asset.availableQuantity || asset.available}
                      </div>
                      {asset.location && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Vị trí:</span> {asset.location}
                        </div>
                      )}
                    </div>
                    {asset.description && (
                      <p className="mt-2 text-sm text-gray-500">{asset.description}</p>
                    )}
                  </div>
                  {userRole === 'ADMIN' && (
                    <div className="flex gap-2 ml-4">
                      {asset.status === 'GOOD' && asset.availableQuantity && asset.availableQuantity > 0 && (
                        <button
                          onClick={() => {
                            setSelectedAsset(asset)
                            setBorrowFormData({ quantity: 1, conditionBefore: '', notes: '' })
                            setShowBorrowModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Mượn"
                        >
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(asset)}
                        className="text-green-600 hover:text-green-800"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id)}
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

          {filteredAssets.length === 0 && (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có tài sản</h3>
              <p className="mt-1 text-sm text-gray-500">Bắt đầu bằng cách thêm tài sản mới.</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'logs' && (
        <div className="mt-8">
          <div className="mb-4 flex gap-4">
            <div className="card flex-1">
              <div className="text-sm text-gray-600">Đang mượn</div>
              <div className="text-2xl font-bold text-blue-600">{activeBorrowLogs.length}</div>
            </div>
            <div className="card flex-1">
              <div className="text-sm text-gray-600">Đã trả</div>
              <div className="text-2xl font-bold text-green-600">{returnedLogs.length}</div>
            </div>
            <div className="card flex-1">
              <div className="text-sm text-gray-600">Bị hư hỏng</div>
              <div className="text-2xl font-bold text-red-600">{damagedLogs.length}</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tài sản</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người mượn</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lượng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mượn lúc</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trả lúc</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  {userRole === 'ADMIN' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {borrowLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.asset.name}</div>
                      <div className="text-sm text-gray-500">{getCategoryLabel(log.asset.category)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.borrower.name}</div>
                      <div className="text-sm text-gray-500">{log.borrower.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.quantity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.borrowedAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.returnedAt ? new Date(log.returnedAt).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.status === 'BORROWED' ? 'bg-blue-100 text-blue-800' :
                        log.status === 'RETURNED' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {log.status === 'BORROWED' ? 'Đang mượn' :
                         log.status === 'RETURNED' ? 'Đã trả' : 'Bị hư hỏng'}
                      </span>
                    </td>
                    {userRole === 'ADMIN' && log.status === 'BORROWED' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedBorrowLog(log)
                            setReturnFormData({ conditionAfter: '', notes: '' })
                            setShowReturnModal(true)
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          <ArrowLeft className="h-5 w-5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {borrowLogs.length === 0 && (
            <div className="text-center py-12">
              <ArrowRight className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không có nhật ký mượn/trả</h3>
            </div>
          )}
        </div>
      )}

      {/* Asset Modal */}
      {showModal && userRole === 'ADMIN' && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingAsset ? 'Chỉnh sửa tài sản' : 'Thêm tài sản'}
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
                      <label className="block text-sm font-medium text-gray-700">Tên tài sản *</label>
                      <input
                        type="text"
                        className="input mt-1"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Danh mục *</label>
                      <select
                        className="input mt-1"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                      >
                        <option value="FURNITURE">Bàn ghế</option>
                        <option value="AUDIO">Loa đài</option>
                        <option value="ELECTRIC">Quạt</option>
                        <option value="TENT">Phông bạt</option>
                        <option value="SPORTS">Dụng cụ thể thao</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Số lượng *</label>
                        <input
                          type="number"
                          min="1"
                          className="input mt-1"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Trạng thái *</label>
                        <select
                          className="input mt-1"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          required
                        >
                          <option value="GOOD">Tốt</option>
                          <option value="BROKEN">Đang hỏng</option>
                          <option value="MAINTENANCE">Đang bảo trì</option>
                          <option value="LIQUIDATION">Cần thanh lý</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vị trí lưu trữ</label>
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                      <textarea
                        className="input mt-1"
                        rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn-primary w-full sm:ml-3 sm:w-auto">
                    {editingAsset ? 'Cập nhật' : 'Tạo mới'}
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

      {/* Borrow Modal */}
      {showBorrowModal && selectedAsset && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowBorrowModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleBorrow}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Mượn tài sản</h3>
                    <button
                      type="button"
                      onClick={() => setShowBorrowModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Tài sản: <span className="font-medium">{selectedAsset.name}</span></p>
                    <p className="text-sm text-gray-600">Có sẵn: <span className="font-medium">{selectedAsset.availableQuantity || selectedAsset.available}</span></p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Số lượng *</label>
                      <input
                        type="number"
                        min="1"
                        max={selectedAsset.availableQuantity || selectedAsset.available}
                        className="input mt-1"
                        value={borrowFormData.quantity}
                        onChange={(e) => setBorrowFormData({ ...borrowFormData, quantity: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tình trạng trước khi mượn</label>
                      <input
                        type="text"
                        className="input mt-1"
                        placeholder="VD: Tốt, không hư hỏng"
                        value={borrowFormData.conditionBefore}
                        onChange={(e) => setBorrowFormData({ ...borrowFormData, conditionBefore: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                      <textarea
                        className="input mt-1"
                        rows={2}
                        value={borrowFormData.notes}
                        onChange={(e) => setBorrowFormData({ ...borrowFormData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn-primary w-full sm:ml-3 sm:w-auto">
                    Mượn
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBorrowModal(false)}
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

      {/* Return Modal */}
      {showReturnModal && selectedBorrowLog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowReturnModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleReturn}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Trả tài sản</h3>
                    <button
                      type="button"
                      onClick={() => setShowReturnModal(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Tài sản: <span className="font-medium">{selectedBorrowLog.asset.name}</span></p>
                    <p className="text-sm text-gray-600">Người mượn: <span className="font-medium">{selectedBorrowLog.borrower.name}</span></p>
                    <p className="text-sm text-gray-600">Số lượng: <span className="font-medium">{selectedBorrowLog.quantity}</span></p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tình trạng sau khi trả *</label>
                      <select
                        className="input mt-1"
                        value={returnFormData.conditionAfter}
                        onChange={(e) => setReturnFormData({ ...returnFormData, conditionAfter: e.target.value })}
                        required
                      >
                        <option value="">Chọn tình trạng</option>
                        <option value="GOOD">Tốt</option>
                        <option value="DAMAGED">Bị hư hỏng</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                      <textarea
                        className="input mt-1"
                        rows={3}
                        value={returnFormData.notes}
                        onChange={(e) => setReturnFormData({ ...returnFormData, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="btn-primary w-full sm:ml-3 sm:w-auto">
                    Trả tài sản
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReturnModal(false)}
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

