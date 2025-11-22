'use client'

import { useState, useEffect } from 'react'
import { Users, MapPin, Building, Plus, Edit, Trash2, UserPlus, UserMinus } from 'lucide-react'
import toast from 'react-hot-toast'

interface Household {
  id: string
  householdId: string
  address: string
  district: {
    id: string
    name: string
  }
  members: Array<{
    id: string
    name: string
    email: string
    role: string
  }>
  createdAt: string
}

interface Person {
  id: string
  fullName: string
  dateOfBirth: string
  gender: string
  idNumber: string
  relationship: string
  createdAt: string
}

export default function MyHouseholdPage() {
  const [household, setHousehold] = useState<Household | null>(null)
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPersonModal, setShowAddPersonModal] = useState(false)
  const [showRemovePersonModal, setShowRemovePersonModal] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: 'Nam',
    idNumber: '',
    relationship: ''
  })

  useEffect(() => {
    fetchHousehold()
    fetchPersons()
  }, [])

  const fetchHousehold = async () => {
    try {
      const response = await fetch('/api/my-household')
      if (response.ok) {
        const data = await response.json()
        setHousehold(data)
      }
    } catch (error) {
      console.error('Error fetching household:', error)
    }
  }

  const fetchPersons = async () => {
    try {
      const response = await fetch('/api/my-household/persons')
      if (response.ok) {
        const data = await response.json()
        setPersons(data)
      }
    } catch (error) {
      console.error('Error fetching persons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName.trim() || !formData.idNumber.trim()) {
      toast.error('Họ tên và số CMND/CCCD là bắt buộc')
      return
    }

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'ADD_PERSON',
          description: `Thêm nhân khẩu: ${formData.fullName}`,
          data: {
            fullName: formData.fullName,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            idNumber: formData.idNumber,
            relationship: formData.relationship
          }
        }),
      })

      if (response.ok) {
        toast.success('Yêu cầu thêm nhân khẩu đã được gửi!')
        setShowAddPersonModal(false)
        setFormData({
          fullName: '',
          dateOfBirth: '',
          gender: 'Nam',
          idNumber: '',
          relationship: ''
        })
      } else {
        const data = await response.json()
        toast.error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleRemovePerson = async (person: Person) => {
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'REMOVE_PERSON',
          description: `Xóa nhân khẩu: ${person.fullName}`,
          data: {
            personId: person.id,
            fullName: person.fullName,
            idNumber: person.idNumber
          }
        }),
      })

      if (response.ok) {
        toast.success('Yêu cầu xóa nhân khẩu đã được gửi!')
        setShowRemovePersonModal(false)
        setSelectedPerson(null)
      } else {
        const data = await response.json()
        toast.error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  const handleUpdateHousehold = async () => {
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'HOUSEHOLD_UPDATE',
          description: 'Cập nhật thông tin hộ khẩu',
          data: {
            householdId: household?.householdId,
            address: household?.address
          }
        }),
      })

      if (response.ok) {
        toast.success('Yêu cầu cập nhật hộ khẩu đã được gửi!')
      } else {
        const data = await response.json()
        toast.error(data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!household) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có hộ khẩu</h3>
        <p className="mt-1 text-sm text-gray-500">
          Bạn chưa được liên kết với hộ khẩu nào. Vui lòng liên hệ admin để được hỗ trợ.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Hộ khẩu của tôi</h1>
          <p className="mt-2 text-sm text-gray-700">
            Thông tin hộ khẩu và thành viên trong gia đình
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowAddPersonModal(true)}
            className="btn btn-primary inline-flex items-center mr-2"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Thêm nhân khẩu
          </button>
          <button
            onClick={handleUpdateHousehold}
            className="btn btn-secondary inline-flex items-center"
          >
            <Edit className="h-4 w-4 mr-2" />
            Yêu cầu cập nhật
          </button>
        </div>
      </div>

      {/* Household Info */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-primary-100">
                <Building className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Thông tin hộ khẩu
              </h3>
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Số hộ khẩu:</span> {household.householdId}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Địa chỉ:</span> {household.address}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Khu phố:</span> {household.district.name}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Thành viên:</span> {household.members.length} người
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 rounded-lg bg-green-100">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Thành viên hộ khẩu
              </h3>
              <div className="mt-2 space-y-1">
                {household.members.map((member) => (
                  <p key={member.id} className="text-sm text-gray-600">
                    <span className="font-medium">{member.name}</span>
                    <span className="ml-2 text-gray-500">({member.role})</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persons List */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Danh sách nhân khẩu
        </h3>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {persons.map((person) => (
            <div key={person.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      {person.fullName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {person.relationship}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPerson(person)
                    setShowRemovePersonModal(true)
                  }}
                  className="text-red-600 hover:text-red-900"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Giới tính:</span>
                  <span className="font-medium">{person.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Ngày sinh:</span>
                  <span className="font-medium">
                    {new Date(person.dateOfBirth).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">CMND/CCCD:</span>
                  <span className="font-medium">{person.idNumber}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {persons.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có nhân khẩu</h3>
          <p className="mt-1 text-sm text-gray-500">
            Hộ khẩu này chưa có nhân khẩu nào. Hãy thêm nhân khẩu đầu tiên.
          </p>
        </div>
      )}

      {/* Add Person Modal */}
      {showAddPersonModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowAddPersonModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddPerson}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Thêm nhân khẩu mới
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        required
                        className="mt-1 input"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Nhập họ và tên đầy đủ"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Ngày sinh *
                        </label>
                        <input
                          type="date"
                          required
                          className="mt-1 input"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Giới tính *
                        </label>
                        <select
                          required
                          className="mt-1 input"
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        >
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Số CMND/CCCD *
                      </label>
                      <input
                        type="text"
                        required
                        className="mt-1 input"
                        value={formData.idNumber}
                        onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                        placeholder="Nhập số CMND/CCCD"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quan hệ với chủ hộ *
                      </label>
                      <select
                        required
                        className="mt-1 input"
                        value={formData.relationship}
                        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      >
                        <option value="">Chọn quan hệ</option>
                        <option value="Chủ hộ">Chủ hộ</option>
                        <option value="Vợ/Chồng">Vợ/Chồng</option>
                        <option value="Con">Con</option>
                        <option value="Cha/Mẹ">Cha/Mẹ</option>
                        <option value="Anh/Chị/Em">Anh/Chị/Em</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="btn btn-primary sm:ml-3"
                  >
                    Gửi yêu cầu
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPersonModal(false)}
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

      {/* Remove Person Modal */}
      {showRemovePersonModal && selectedPerson && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowRemovePersonModal(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Xác nhận xóa nhân khẩu
                </h3>
                
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Bạn có chắc chắn muốn xóa nhân khẩu <strong>{selectedPerson.fullName}</strong> khỏi hộ khẩu?
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <UserMinus className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Lưu ý
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Thao tác này sẽ tạo yêu cầu xóa nhân khẩu và cần được admin duyệt.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => handleRemovePerson(selectedPerson)}
                  className="btn btn-danger sm:ml-3"
                >
                  Gửi yêu cầu xóa
                </button>
                <button
                  onClick={() => setShowRemovePersonModal(false)}
                  className="btn btn-secondary mt-3 sm:mt-0"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
