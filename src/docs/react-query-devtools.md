# React Query DevTools Guide

## Overview

React Query DevTools là một công cụ mạnh mẽ giúp theo dõi, gỡ lỗi và tối ưu hóa các truy vấn dữ liệu trong ứng dụng Choice E-Learning. DevTools đã được tích hợp sẵn vào ứng dụng và tự động hiển thị trong môi trường phát triển (development).

## Cách Truy Cập DevTools

1. **Mở DevTools**: Khi chạy ứng dụng ở chế độ development, bạn sẽ thấy một nút `{_}` ở góc dưới bên phải của màn hình. Nhấp vào nút này để mở bảng điều khiển DevTools.

2. **Tùy chỉnh vị trí**: DevTools có thể được cấu hình để hiển thị ở các vị trí khác nhau (dưới, trên, trái, phải) bằng cách điều chỉnh prop `position` trong `QueryProvider`.

## Tính Năng Chính

### 1. Trình Khám Phá Truy Vấn (Query Explorer)

- **Danh sách truy vấn**: Hiển thị tất cả các truy vấn đang hoạt động với các thông tin về khóa, trạng thái và dữ liệu.
- **Lọc truy vấn**: Lọc theo trạng thái (active, inactive, stale).
- **Chi tiết truy vấn**: Nhấp vào một truy vấn để xem thông tin chi tiết.

### 2. Trình Kiểm Tra Bộ Nhớ Đệm (Cache Inspector)

- **Xem dữ liệu đã lưu trong bộ nhớ đệm**: Kiểm tra trạng thái hiện tại của bộ nhớ đệm React Query.
- **Thời gian quá hạn**: Hiểu khi nào dữ liệu trở nên cũ (stale).
- **Cấu trúc dữ liệu**: Xem cấu trúc dữ liệu được lưu trữ cho mỗi truy vấn.

### 3. Hành Động Truy Vấn (Query Actions)

- **Refetch**: Thực hiện lại truy vấn thủ công.
- **Reset**: Đặt lại truy vấn về trạng thái ban đầu.
- **Xóa bộ nhớ đệm**: Xóa bộ nhớ đệm cho các truy vấn cụ thể.
- **Theo dõi trạng thái**: Quan sát các thay đổi trạng thái truy vấn theo thời gian thực.

### 4. Theo Dõi Yêu Cầu (Request Tracing)

- **Thời gian thực hiện**: Xem khi nào các truy vấn được thực thi.
- **Thời gian hoàn thành**: Theo dõi thời gian hoàn thành truy vấn.
- **Theo dõi thử lại**: Quan sát các lần thử lại và làm mới nền.

## Cấu Hình DevTools

DevTools được cấu hình thông qua `QueryProvider` trong file `src/client/providers/QueryProvider.tsx`. Bạn có thể tùy chỉnh các tùy chọn sau:

```tsx
<QueryProvider 
  enableDevTools={true}           // Bật/tắt DevTools (mặc định: true trong development)
  initialIsOpen={false}           // DevTools mở sẵn khi tải trang (mặc định: false)
  position="bottom"               // Vị trí của panel ('bottom', 'top', 'left', 'right')
>
  <App />
</QueryProvider>
```

## Các Thời Gian Tối Ưu Cho Các Loại Dữ Liệu

Ứng dụng Choice E-Learning triển khai các cấu hình thời gian tối ưu cho các loại dữ liệu khác nhau, được định nghĩa trong `DATA_LIFETIME`:

| Loại dữ liệu | Mô tả | staleTime | gcTime |
|--------------|-------|-----------|--------|
| STATIC | Dữ liệu tĩnh hiếm khi thay đổi (enums, constants) | 24 giờ | 7 ngày |
| REFERENCE | Dữ liệu tham khảo đôi khi thay đổi (topics, categories) | 1 giờ | 24 giờ |
| STANDARD | Dữ liệu tiêu chuẩn cập nhật vừa phải (courses, FAQs) | 5 phút | 30 phút |
| DYNAMIC | Dữ liệu động thay đổi thường xuyên (user profile, notifications) | 30 giây | 5 phút |
| REALTIME | Dữ liệu thời gian thực cần cập nhật liên tục (chat messages, active users) | 0 (luôn stale) | 1 phút |

## Sử Dụng DATA_LIFETIME trong Custom Hooks

Bạn có thể sử dụng các cấu hình `DATA_LIFETIME` trong custom hooks để đảm bảo các truy vấn có cài đặt phù hợp:

```tsx
import { useQuery } from '@tanstack/react-query';
import { DATA_LIFETIME } from '@/client/providers/QueryProvider';

export function useTopics() {
  return useQuery({
    queryKey: ['topics'],
    queryFn: fetchTopics,
    // Sử dụng cấu hình REFERENCE vì danh sách chủ đề ít thay đổi
    staleTime: DATA_LIFETIME.REFERENCE.staleTime,
    gcTime: DATA_LIFETIME.REFERENCE.gcTime
  });
}

export function useNotifications(userId: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => fetchNotifications(userId),
    // Sử dụng cấu hình DYNAMIC vì thông báo thay đổi thường xuyên
    staleTime: DATA_LIFETIME.DYNAMIC.staleTime,
    gcTime: DATA_LIFETIME.DYNAMIC.gcTime
  });
}
```

## Mẹo Sử Dụng Hiệu Quả

1. **Kiểm tra các truy vấn trùng lặp**: Sử dụng DevTools để phát hiện các truy vấn có queryKey trùng lặp, giúp tránh yêu cầu mạng không cần thiết.

2. **Xác định staleTime tối ưu**: Quan sát thời gian dữ liệu trở nên cũ và tần suất cập nhật để điều chỉnh staleTime phù hợp cho từng loại dữ liệu.

3. **Theo dõi việc sử dụng bộ nhớ**: Nếu ứng dụng sử dụng quá nhiều bộ nhớ, kiểm tra gcTime (garbage collection time) và điều chỉnh để giải phóng bộ nhớ sớm hơn nếu cần.

4. **Phân tích thời gian tải**: Sử dụng tab "Timeline" trong DevTools để xác định các truy vấn chậm và tìm cơ hội tối ưu hóa.

5. **Giám sát prefetching**: Sử dụng DevTools để xác nhận rằng prefetching đang hoạt động đúng cách, cung cấp trải nghiệm người dùng tốt hơn.

## Khắc Phục Sự Cố Phổ Biến

| Vấn đề | Nguyên nhân có thể | Giải pháp |
|--------|-------------------|-----------|
| Truy vấn liên tục refetch | staleTime quá ngắn | Tăng staleTime hoặc sử dụng cấu hình DATA_LIFETIME phù hợp |
| Truy vấn không tự động cập nhật | refetchOnWindowFocus bị tắt | Kiểm tra cấu hình trong QueryProvider |
| Dữ liệu lỗi thời | staleTime quá dài | Giảm staleTime hoặc gọi refetch thủ công khi cần |
| Bộ nhớ sử dụng cao | gcTime quá dài | Giảm gcTime để giải phóng bộ nhớ đệm sớm hơn |
| Queries không hợp nhất | Querykeys không nhất quán | Đảm bảo sử dụng cấu trúc queryKey nhất quán |

## Khuyến Nghị Phát Triển

1. **Query Key Structure**: Luôn sử dụng cấu trúc queryKey nhất quán, ưu tiên mảng để dễ dàng phân cấp (`['courses', courseId]`).

2. **Metadata**: Sử dụng trường `meta` trong truy vấn để lưu trữ thông tin bổ sung như `suppressErrorToast: true` nếu bạn muốn xử lý lỗi thủ công.

3. **Cấu trúc custom hook**: Tạo custom hook ở cấp domain (như `useCoursesQuery`) và kết hợp với `DATA_LIFETIME` phù hợp.

4. **Error Handling**: Sử dụng React Query DevTools để gỡ lỗi khi truy vấn thất bại và xác định nguyên nhân gốc rễ.

## Kết Luận

React Query DevTools là một công cụ thiết yếu cho việc phát triển và gỡ lỗi các ứng dụng sử dụng React Query. Hãy tận dụng đầy đủ tính năng của nó để tối ưu hóa hiệu suất truy vấn dữ liệu trong Choice E-Learning. 