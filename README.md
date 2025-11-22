# Citizen Management - Frontend

Frontend application cho hệ thống quản lý nhân khẩu và nhà văn hóa, được xây dựng bằng Next.js 14, TypeScript và Tailwind CSS.

## 🚀 Tính năng

- **Quản lý hộ khẩu**: Xem, tạo, sửa, xóa thông tin hộ khẩu
- **Quản lý nhân khẩu**: Quản lý thông tin các thành viên trong hộ khẩu
- **Quản lý nhà văn hóa**: Quản lý 3 tòa nhà nhà văn hóa với bản đồ
- **Đặt lịch**: Đặt lịch sử dụng nhà văn hóa với chế độ public/private
- **Yêu cầu**: Gửi và quản lý yêu cầu từ người dùng
- **Thống kê**: Dashboard với các thống kê tổng quan

## 🛠️ Công nghệ

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Headless UI
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Maps**: Leaflet, React Leaflet

## 📦 Cài đặt

### Yêu cầu hệ thống

- Node.js 18+
- npm hoặc yarn

### Bước 1: Clone repository

```bash
git clone https://github.com/hungnah/Citizen-Management-FE
cd Citizen-Management-FE
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Cấu hình environment

Tạo file `.env.local`:

```env
# API Base URL - Kết nối với Backend API
# Development
NEXT_PUBLIC_API_URL=http://localhost:3001

# Staging
# NEXT_PUBLIC_API_URL=https://staging.api.project.com

# Production
# NEXT_PUBLIC_API_URL=https://api.project.com
```

**Lưu ý quan trọng**: Frontend luôn kết nối với một môi trường API ổn định. Không chạy trực tiếp code backend trong repo này.

### Bước 4: Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:3000`

## 🔧 Cấu hình API

Frontend sử dụng file `lib/api.ts` để quản lý kết nối API. API base URL được cấu hình thông qua biến môi trường `NEXT_PUBLIC_API_URL`.

### Môi trường API

- **Development**: `http://localhost:3001` - Backend chạy local
- **Staging**: `https://staging.api.project.com` - Backend staging
- **Production**: `https://api.project.com` - Backend production

### Sử dụng API trong code

```typescript
import { apiFetch } from '@/lib/api'

// GET request
const response = await apiFetch('/api/households')
const data = await response.json()

// POST request
const response = await apiFetch('/api/households', {
  method: 'POST',
  body: JSON.stringify({ ... })
})
```

## 🏗️ Cấu trúc dự án

```
frontend/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Authentication pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/
│   └── api.ts            # API configuration và helpers
├── public/                # Static files
└── package.json
```

## 🚀 Build và Deploy

### Build production

```bash
npm run build
npm start
```

### Environment Variables cho Production

```env
NEXT_PUBLIC_API_URL=https://api.project.com
NODE_ENV=production
```

## 📝 Ghi chú

- Frontend không chứa code backend
- Tất cả API calls đều đi qua `apiFetch` helper
- Frontend độc lập với backend, có thể deploy riêng biệt
- CORS phải được cấu hình đúng ở backend để cho phép frontend kết nối

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

MIT License

