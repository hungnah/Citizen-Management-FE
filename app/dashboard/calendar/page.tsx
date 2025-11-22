'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Building, Users, Eye, EyeOff, Filter } from 'lucide-react'

interface CulturalCenter {
  id: string
  name: string
  building: string
  floor: number | null
  room: string | null
  capacity: number
}

interface Booking {
  id: string
  title: string
  description: string | null
  startTime: string
  endTime: string
  visibility: 'PUBLIC' | 'PRIVATE'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  culturalCenter: CulturalCenter
  user: {
    id: string
    name: string
  }
}

const BUILDINGS = [
  { id: 'A', name: 'Tòa nhà A', color: 'bg-blue-500' },
  { id: 'B', name: 'Tòa nhà B', color: 'bg-green-500' },
  { id: 'C', name: 'Tòa nhà C', color: 'bg-purple-500' }
]

export default function CalendarPage() {
  const [centers, setCenters] = useState<CulturalCenter[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedBuilding, setSelectedBuilding] = useState<string>('all')
  const [showPrivate, setShowPrivate] = useState(false)

  useEffect(() => {
    fetchCenters()
    fetchBookings()
  }, [selectedDate, selectedBuilding, showPrivate])

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

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings/calendar?date=${selectedDate}&building=${selectedBuilding}&showPrivate=${showPrivate}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour <= 22; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour
      })
    }
    return slots
  }

  const getBookingsForCenter = (centerId: string) => {
    return bookings.filter(booking => 
      booking.culturalCenter.id === centerId && 
      booking.status === 'APPROVED'
    )
  }

  const isTimeSlotBooked = (centerId: string, hour: number) => {
    const centerBookings = getBookingsForCenter(centerId)
    return centerBookings.some(booking => {
      const startHour = new Date(booking.startTime).getHours()
      const endHour = new Date(booking.endTime).getHours()
      return hour >= startHour && hour < endHour
    })
  }

  const getBookingForTimeSlot = (centerId: string, hour: number) => {
    const centerBookings = getBookingsForCenter(centerId)
    return centerBookings.find(booking => {
      const startHour = new Date(booking.startTime).getHours()
      const endHour = new Date(booking.endTime).getHours()
      return hour >= startHour && hour < endHour
    })
  }

  const filteredCenters = centers.filter(center => 
    selectedBuilding === 'all' || center.building === selectedBuilding
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
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Lịch nhà văn hóa</h1>
          <p className="mt-2 text-sm text-gray-700">
            Xem lịch trống và lịch đã đăng ký của các nhà văn hóa
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <div className="sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ngày
          </label>
          <input
            type="date"
            className="input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tòa nhà
          </label>
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
        <div className="sm:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hiển thị
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showPrivate}
                onChange={(e) => setShowPrivate(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Lịch riêng tư</span>
            </label>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mt-8">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 mb-4">
              <div className="col-span-2">
                <div className="text-sm font-medium text-gray-500">Thời gian</div>
              </div>
              {filteredCenters.map((center) => (
                <div key={center.id} className="col-span-1">
                  <div className="text-center">
                    <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium text-white ${BUILDINGS.find(b => b.id === center.building)?.color || 'bg-gray-500'}`}>
                      {center.building}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      {center.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Tầng {center.floor || 'N/A'}
                      {center.room && ` - ${center.room}`}
                    </div>
                    <div className="text-xs text-gray-500">
                      {center.capacity} chỗ
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Time slots */}
            <div className="space-y-1">
              {getTimeSlots().map((slot) => (
                <div key={slot.time} className="grid grid-cols-12 gap-4">
                  <div className="col-span-2 flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {slot.time}
                    </div>
                  </div>
                  {filteredCenters.map((center) => {
                    const isBooked = isTimeSlotBooked(center.id, slot.hour)
                    const booking = getBookingForTimeSlot(center.id, slot.hour)
                    
                    return (
                      <div key={center.id} className="col-span-1">
                        <div className={`h-12 rounded-lg border-2 flex items-center justify-center ${
                          isBooked 
                            ? booking?.visibility === 'PUBLIC' || showPrivate
                              ? 'bg-red-100 border-red-300' 
                              : 'bg-gray-100 border-gray-300'
                            : 'bg-green-100 border-green-300'
                        }`}>
                          {isBooked ? (
                            booking?.visibility === 'PUBLIC' || showPrivate ? (
                              <div className="text-center">
                                <div className="text-xs font-medium text-red-800">
                                  {booking?.title}
                                </div>
                                <div className="text-xs text-red-600">
                                  {booking?.user.name}
                                </div>
                                {booking?.visibility === 'PRIVATE' && (
                                  <EyeOff className="h-3 w-3 text-red-600 mx-auto mt-1" />
                                )}
                              </div>
                            ) : (
                              <div className="text-center">
                                <div className="text-xs text-gray-500">Đã đặt</div>
                                <EyeOff className="h-3 w-3 text-gray-500 mx-auto mt-1" />
                              </div>
                            )
                          ) : (
                            <div className="text-center">
                              <div className="text-xs text-green-600 font-medium">Trống</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-8 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Trống</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Đã đặt (công khai)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Đã đặt (riêng tư)</span>
        </div>
      </div>

      {/* Building Stats */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {BUILDINGS.map((building) => {
          const buildingCenters = filteredCenters.filter(c => c.building === building.id)
          const buildingBookings = bookings.filter(b => 
            b.culturalCenter.building === building.id && 
            b.status === 'APPROVED'
          )
          const totalCapacity = buildingCenters.reduce((sum, c) => sum + c.capacity, 0)
          
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
                      <p className="font-medium">{buildingCenters.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Sức chứa</p>
                      <p className="font-medium">{totalCapacity}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Lịch đặt</p>
                      <p className="font-medium">{buildingBookings.length}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tỷ lệ sử dụng</p>
                      <p className="font-medium">
                        {buildingCenters.length > 0 
                          ? Math.round((buildingBookings.length / (buildingCenters.length * 15)) * 100) 
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
