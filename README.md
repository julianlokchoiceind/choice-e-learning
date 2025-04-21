# Choice E-Learning Platform

Nền tảng học trực tuyến xây dựng bằng Next.js, MongoDB và Prisma.

## Yêu cầu hệ thống

- Node.js 18 trở lên
- MongoDB đã được cài đặt
- npm hoặc yarn

## Bắt đầu phát triển

1. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   # hoặc
   yarn install
   ```

2. Tạo file .env từ .env.example:
   ```bash
   cp .env.example .env
   ```

3. Chỉnh sửa file .env để thiết lập các biến môi trường cần thiết.

4. Tạo Prisma client:
   ```bash
   npx prisma generate
   ```

5. Đẩy schema lên database:
   ```bash
   npx prisma db push
   ```

6. Khởi động server phát triển:
   ```bash
   npm run dev
   # hoặc
   yarn dev
   ```

Truy cập [http://localhost:3000](http://localhost:3000) để xem kết quả.

## Cấu trúc thư mục

- `/app` - Các trang và API routes (Next.js App Router)
- `/components` - React components dùng chung (đang dần chuyển vào `/client/components`)
- `/client` - Mã phía máy khách (components, hooks, styles)
- `/server` - Mã phía máy chủ (API, models, middleware)
- `/lib` - Các thư viện và utilities dùng chung cho cả client và server
  - `/lib/auth` - Dịch vụ xác thực
  - `/lib/db` - Truy cập cơ sở dữ liệu
  - `/lib/services` - Các dịch vụ theo miền
  - `/lib/utils` - Các tiện ích
- `/types` - Định nghĩa kiểu dữ liệu toàn cục
- `/prisma` - Schema database và migration
- `/public` - Assets tĩnh

## Quy ước về mã nguồn

### Client vs Server code

- Mã phía máy khách thuần túy nên được đặt trong thư mục `/client`
  - Các components UI nên được đánh dấu với `"use client"` khi cần thiết
  - Hooks và utilities phía máy khách nên được đặt trong `/client/hooks` và `/client/utils`

- Mã phía máy chủ thuần túy nên được đặt trong thư mục `/server`
  - Các API handlers nên được đặt trong `/server/api`
  - Các xử lý middleware nên được đặt trong `/server/middleware`

- Mã dùng chung cho cả client và server nên được đặt trong thư mục `/lib`
  - Các dịch vụ theo miền nên được đặt trong `/lib/services/[domain]`
  - Các tiện ích nên được đặt trong `/lib/utils/[domain]`

### Tổ chức theo miền (Domain-driven)

Mã nên được tổ chức theo miền thay vì theo loại công nghệ, ví dụ:

```
/lib/services/courses/course-service.ts   # Thay vì /services/courses.ts
/lib/services/auth/auth-service.ts        # Thay vì /services/auth.ts
```

## Tính năng chính

- Đăng ký và đăng nhập người dùng
- Phân quyền (Học viên, Giảng viên, Admin)
- Khóa học với bài giảng và thử thách
- Đăng ký và hủy đăng ký khóa học
- Hệ thống đánh giá và nhận xét
- Bảng điều khiển quản trị

## Quản lý khóa học

### Đăng ký khóa học
Học viên có thể đăng ký khóa học từ trang chi tiết khóa học. Sau khi đăng ký, họ sẽ có quyền truy cập vào nội dung của khóa học.

### Hủy đăng ký khóa học
Học viên có thể hủy đăng ký khóa học từ:
1. Trang chi tiết khóa học - bằng cách nhấn nút "Unenroll from Course"
2. Trang bảng điều khiển - bằng cách nhấn nút "Unenroll" bên cạnh khóa học

Lưu ý: Tiến trình học tập sẽ được giữ lại nếu học viên quyết định đăng ký lại khóa học trong tương lai.

## Xử lý sự cố

Nếu gặp vấn đề với Prisma và MongoDB, hãy đảm bảo:

1. MongoDB đang chạy
2. Chuỗi kết nối trong .env đúng định dạng
3. Prisma client đã được tạo mới sau khi thay đổi schema

## Tìm hiểu thêm

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
