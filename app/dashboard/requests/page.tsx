'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Check, X, Eye, FileText, Clock, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Request {
  id: string
  type: 'HOUSEHOLD_UPDATE' | 'ADD_PERSON' | 'REMOVE_PERSON' | 'CULTURAL_CENTER_BOOKING'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  description: string
  data: string | null
  user: {
    id: string
    name: string
    email: string
  }
  household: {
    id: string
    householdId: string
    address: string
  } | null
  createdAt: string
  updatedAt: string
}

const REQUEST_TYPES = {
  HOUSEHOLD_UPDATE: 'Cập nhật hộ khẩu',
  ADD_PERSON: 'Thêm nhân khẩu',
  REMOVE_PERSON: 'Xóa nhân khẩu',
  CULTURAL_CENTER_BOOKING: 'Đặt lịch nhà văn hóa'
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/requests')
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải danh sách yêu cầu')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/requests/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        toast.success(`Yêu cầu đã được ${status === 'APPROVED' ? 'duyệt' : 'từ chối'}!`)
        fetchRequests()
      } else {
        const data = await response.json()
        toast.error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.household && request.household.householdId.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus
    const matchesType = selectedType === 'all' || request.type === selectedType
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'Đã duyệt'
      case 'REJECTED': return 'Từ chối'
      case 'PENDING': return 'Chờ duyệt'
      default: return status
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'HOUSEHOLD_UPDATE': return FileText
      case 'ADD_PERSON': return Plus
      case 'REMOVE_PERSON': return X
      case 'CULTURAL_CENTER_BOOKING': return Clock
      default: return FileText
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý yêu cầu</h1>
          <p className="mt-2 text-sm text-gray-700">
            Xem và duyệt các yêu cầu từ người dùng
          </p>
        </div>
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
              placeholder="Tìm kiếm theo mô tả, người dùng hoặc số hộ khẩu..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="sm:w-48">
          <select
            className="input"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
        <div className="sm:w-48">
          <select
            className="input"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">Tất cả loại</option>
            {Object.entries(REQUEST_TYPES).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="mt-8 space-y-4">
        {filteredRequests.map((request) => {
          const TypeIcon = getTypeIcon(request.type)
          return (
            <div key={request.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-lg bg-primary-100">
                      <TypeIcon className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {REQUEST_TYPES[request.type as keyof typeof REQUEST_TYPES]}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {request.user.name} - {request.user.email}
                    </p>
                    {request.household && (
                      <p className="text-sm text-gray-500">
                        Hộ khẩu: {request.household.householdId} - {request.household.address}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">{request.description}</p>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Tạo lúc: {new Date(request.createdAt).toLocaleString('vi-VN')}
                  {request.updatedAt !== request.createdAt && (
                    <span className="ml-2">
                      - Cập nhật: {new Date(request.updatedAt).toLocaleString('vi-VN')}
                    </span>
                  )}
                </div>
                {request.status === 'PENDING' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStatusChange(request.id, 'APPROVED')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Duyệt
                    </button>
                    <button
                      onClick={() => handleStatusChange(request.id, 'REJECTED')}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Không có yêu cầu nào</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || selectedStatus !== 'all' || selectedType !== 'all'
              ? 'Không tìm thấy yêu cầu phù hợp với bộ lọc.' 
              : 'Chưa có yêu cầu nào được gửi.'}
          </p>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedRequest(null)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Chi tiết yêu cầu
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Loại yêu cầu
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {REQUEST_TYPES[selectedRequest.type as keyof typeof REQUEST_TYPES]}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Người gửi
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedRequest.user.name} ({selectedRequest.user.email})
                    </p>
                  </div>
                  
                  {selectedRequest.household && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Hộ khẩu
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedRequest.household.householdId} - {selectedRequest.household.address}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Mô tả
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedRequest.description}
                    </p>
                  </div>
                  
                  {selectedRequest.data && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Dữ liệu bổ sung
                      </label>
                      <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded border overflow-auto">
                        {JSON.stringify(JSON.parse(selectedRequest.data), null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Trạng thái
                    </label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusText(selectedRequest.status)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedRequest.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedRequest.id, 'APPROVED')
                        setSelectedRequest(null)
                      }}
                      className="btn btn-primary sm:ml-3"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => {
                        handleStatusChange(selectedRequest.id, 'REJECTED')
                        setSelectedRequest(null)
                      }}
                      className="btn btn-danger sm:ml-3"
                    >
                      Từ chối
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="btn btn-secondary mt-3 sm:mt-0"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
