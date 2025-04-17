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
- `/components` - React components dùng chung 
- `/lib` - Các thư viện và utilities
- `/prisma` - Schema database và migration
- `/public` - Assets tĩnh

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
