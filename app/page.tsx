import Link from 'next/link'
import { Home, Users, Building, Calendar, Shield } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-primary-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">
                Hệ thống quản lý nhân khẩu
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/login" 
                className="btn btn-secondary"
              >
                Đăng nhập
              </Link>
              <Link 
                href="/register" 
                className="btn btn-primary"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Quản lý nhân khẩu
            <span className="text-primary-600"> hiện đại</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Hệ thống quản lý hộ khẩu, nhân khẩu và nhà văn hóa với công nghệ tiên tiến
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <div className="rounded-md shadow">
              <Link 
                href="/login" 
                className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
              >
                Bắt đầu ngay
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="card text-center">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Quản lý hộ khẩu
              </h3>
              <p className="mt-2 text-gray-500">
                Tạo, xem, sửa, xóa thông tin hộ khẩu và nhân khẩu một cách dễ dàng
              </p>
            </div>

            <div className="card text-center">
              <div className="flex justify-center">
                <Building className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Nhà văn hóa
              </h3>
              <p className="mt-2 text-gray-500">
                Đặt lịch sử dụng nhà văn hóa với 3 tòa nhà và quản lý lịch trống
              </p>
            </div>

            <div className="card text-center">
              <div className="flex justify-center">
                <Calendar className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Lịch đăng ký
              </h3>
              <p className="mt-2 text-gray-500">
                Xem lịch trống và đặt lịch sử dụng nhà văn hóa công khai hoặc riêng tư
              </p>
            </div>

            <div className="card text-center">
              <div className="flex justify-center">
                <Shield className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Phân quyền
              </h3>
              <p className="mt-2 text-gray-500">
                Hệ thống phân quyền Admin và User với các tính năng phù hợp
              </p>
            </div>

            <div className="card text-center">
              <div className="flex justify-center">
                <Home className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Phân loại khu phố
              </h3>
              <p className="mt-2 text-gray-500">
                Quản lý và phân loại theo từng khu phố một cách có hệ thống
              </p>
            </div>

            <div className="card text-center">
              <div className="flex justify-center">
                <Users className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Yêu cầu & Duyệt
              </h3>
              <p className="mt-2 text-gray-500">
                Tạo yêu cầu và hệ thống duyệt tự động với thông báo
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">
              © 2024 Hệ thống quản lý nhân khẩu. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
