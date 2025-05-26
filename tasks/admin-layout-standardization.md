# Tài liệu Task: Chuẩn hóa layout giao diện admin

## Phân tích vấn đề:

1. Các trang admin (courses, topic, faq) có layout không nhất quán sau khi chuyển sang react query và loading state, khác biệt với trang admin/student (đang ổn định).
2. Ô sort/filter phải luôn nằm bên phải và thanh search luôn nằm bên trái (như yêu cầu).
3. Các trang admin/course, admin/topic, admin/faq có thêm nút filter hoặc search dư thừa.
4. Trang admin/student cần xóa text "Sort by:" trong dropdown filter.

## Các task cụ thể (ưu tiên từ cao đến thấp):

### Task 1: "Chuẩn hóa layout trang admin/courses"
- **Ngữ cảnh**: `/src/app/admin/courses/page.tsx`
- **Vị trí số dòng**: 245-273 (phần filter và search controls)
- **Cách xử lý chi tiết**:
  * Loại bỏ nút "Filter" dư thừa (dòng 270-274)
  * Đảm bảo input search nằm bên trái và select sort nằm bên phải
  * Cấu trúc lại div chứa filter để tương tự như trang students
  * Đảm bảo logic tìm kiếm vẫn hoạt động đúng mà không cần nút filter

### Task 2: "Chuẩn hóa layout trang admin/faqs"
- **Ngữ cảnh**: `/src/app/admin/faqs/page.tsx`
- **Vị trí số dòng**: 106-134 (phần filter và search controls)
- **Cách xử lý chi tiết**:
  * Loại bỏ nút "Search" dư thừa (dòng 132-135)
  * Đảm bảo input search nằm bên trái và dropdown filter nằm bên phải
  * Di chuyển dropdown category ra ngoài phần search, đặt vào phần bên phải cùng với sort
  * Giữ nguyên cơ chế tìm kiếm theo thời gian thực hiện có

### Task 3: "Chuẩn hóa layout trang admin/topics"
- **Ngữ cảnh**: `/src/app/admin/topics/page.tsx`
- **Vị trí số dòng**: 144-183 (phần filter và search controls)
- **Cách xử lý chi tiết**: 
  * Loại bỏ nút "Search" dư thừa (dòng 179-183)
  * Đảm bảo input search nằm bên trái và dropdown filter nằm bên phải
  * Giữ nguyên cơ chế tìm kiếm theo thời gian thực hiện có
  * Đảm bảo logic lọc theo status (Active/Inactive) vẫn hoạt động đúng

### Task 4: "Loại bỏ chữ 'Sort By:' trong dropdown filter trang admin/students"
- **Ngữ cảnh**: `/src/client/components/admin/students/StudentList.tsx`
- **Vị trí số dòng**: 240-248 (phần select options)
- **Cách xử lý chi tiết**:
  * Sửa tất cả các option từ 'Sort By: Newest' thành 'Newest', 'Sort By: Oldest' thành 'Oldest', vv.
  * Giữ nguyên logic xử lý, chỉ thay đổi text hiển thị
  * Đảm bảo không làm ảnh hưởng đến các chức năng liên quan

### Task 5: "Cập nhật cấu hình tìm kiếm không phân biệt chữ hoa/chữ thường cho admin/courses"
- **Ngữ cảnh**: `/src/app/api/admin/courses/route.ts`
- **Vị trí số dòng**: 392-397 (phần cấu hình tìm kiếm)
- **Cách xử lý chi tiết**:
  * Cập nhật cấu hình tìm kiếm hiện tại để thêm `mode: 'insensitive'`
  * Đoạn code hiện tại:
  ```typescript
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } }
    ];
  }
  ```
  * Thay đổi thành:
  ```typescript
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }
  ```
  * Việc này sẽ giúp tìm kiếm không phân biệt chữ hoa/thường, cải thiện trải nghiệm người dùng và nhất quán với các trang admin khác

### Task 6: "Cải thiện loading skeleton cho bảng admin theo best practice"
- **Ngữ cảnh**: `/src/client/components/common/LoadingState.tsx`
- **Vị trí số dòng**: 91-107 (phần table variant)
- **Cách xử lý chi tiết**:
  * Thiết kế lại hoàn toàn loading skeleton cho bảng, đảm bảo khớp chính xác với cấu trúc bảng thực tế
  * Bổ sung interface TypeScript cho props mới giúp tùy chỉnh skeleton:
  ```typescript
  // Bổ sung vào LoadingStateProps
  export interface LoadingStateProps {
    // Existing props...
    columns?: number; // Số cột
    rows?: number; // Số hàng
    columnWidths?: string[]; // Độ rộng tương đối cho từng cột (e.g. ['5%', '30%', '15%'])
    headerHeight?: number; // Chiều cao header
    showHeader?: boolean; // Hiển thị header
  }
  ```
  * Áp dụng các best practice trong skeleton UI:
    - Sử dụng cấu trúc bảng thật (`<table>`, `<thead>`, `<tbody>`) thay vì div
    - Mô phỏng chính xác vị trí và kích thước các cột
    - Sử dụng hiệu ứng pulse tiêu chuẩn từ Tailwind
    - Áp dụng tỉ lệ màu sắc nhất quán theo thiết kế hiện tại
  * Tối ưu hiệu suất bằng cách:
    - Sử dụng React.memo cho component để tránh render không cần thiết
    - Tối ưu hàm tạo dãy bằng Array.from thay vì spread operator
    - Cache các tính toán với useMemo cho các giá trị phức tạp
  * Render thông minh dựa trên vị trí cột để mô phỏng chính xác cấu trúc dữ liệu
  * Đảm bảo tất cả thông báo đều bằng tiếng Anh
  * Thay thế hoàn toàn skeleton hiện tại, không giữ tương thích ngược

## Lưu ý về tính năng tìm kiếm:

Hiện tại, tìm kiếm trong các trang admin (**courses**, **faqs**, **topics**) hoạt động theo thời gian thực nhờ React Query - khi người dùng nhập từng ký tự vào ô search, kết quả sẽ tự động cập nhật mà không cần nhấn Enter hay nút Search/Filter. Cơ chế này hoạt động nhờ:

1. State `searchQuery` cập nhật qua handler `onChange`
2. React Query sử dụng `searchQuery` trong `queryKey`
3. Khi `queryKey` thay đổi, React Query tự động gọi lại API

Khi thực hiện chuẩn hóa cấu trúc layout, cần đặc biệt lưu ý giữ nguyên cơ chế này. Các nút Filter/Search chỉ là tùy chọn thêm và có thể loại bỏ mà không ảnh hưởng đến chức năng tìm kiếm theo thời gian thực này.

## Lưu ý khi thực hiện task:

### Lưu ý chung:

1. **Tuân thủ Domain-Driven Design**: Tổ chức code theo domain và tránh tạo thư mục lồng nhau không cần thiết.

2. **Alias Imports**: Luôn sử dụng alias imports (@/client/..., @/server/..., @/shared/...), tránh dùng relative imports.

3. **Không tương thích ngược**: Loại bỏ code cũ không cần thiết, không phải giữ tương thích với code hiện tại đã lỗi thời.

4. **Tránh code dư thừa**: Tập trung vào giải pháp tối ưu và xóa code không cần thiết.

5. **UI nhất quán**: Đảm bảo tất cả các trang admin đều tuân theo cùng một cấu trúc với search ở bên trái và sort/filter ở bên phải.

### Lưu ý cụ thể cho từng task:

**Task 1**: 
- Cần xem xét kỹ lưỡng các filter level/status để đảm bảo chúng vẫn hoạt động đúng sau khi cấu trúc lại.
- **Đặc biệt quan trọng**: Phải giữ nguyên tính năng tìm kiếm theo thời gian thực - khi người dùng nhập từng ký tự vào ô search, kết quả sẽ tự động cập nhật mà không cần nhấn Enter hay nút Filter.
- Việc loại bỏ nút Filter không được làm ảnh hưởng đến cơ chế hoạt động này.
- Cơ chế hoạt động này dựa trên việc React Query tự động refetch khi `queryKey` thay đổi (do `searchQuery` cập nhật).

**Task 2**: 
- Phải đảm bảo category filter vẫn hoạt động đúng khi di chuyển vị trí.
- **Đặc biệt quan trọng**: Tương tự như trang courses, cần giữ nguyên tính năng tìm kiếm theo thời gian thực dựa vào React Query khi loại bỏ nút "Search".

**Task 3**: 
- **Đặc biệt quan trọng**: Cũng tương tự như các trang khác, cần giữ nguyên tính năng tìm kiếm theo thời gian thực dựa trên React Query queryKey.
- Giữ nguyên chức năng chọn lọc theo status (Active/Inactive) nhưng di chuyển về bên phải.
- Đảm bảo responsive vẫn được duy trì khi thay đổi cấu trúc layout.

**Task 4**: 
- Chỉ thay đổi text hiển thị, không làm thay đổi logic xử lý sort.
- Đảm bảo tất cả các dropdown option đều được cập nhật nhất quán.

**Task 5**: 
- Đây là task ưu tiên cao về UX nhưng không liên quan trực tiếp đến chuẩn hóa layout.
- Đảm bảo biến search được xử lý đúng trước khi áp dụng mode insensitive.
- Test kỹ tính năng tìm kiếm sau khi thay đổi để đảm bảo nó vẫn hoạt động chính xác.

**Task 6**: 
- Áp dụng các best practice trong UI design: skeleton loader phải phản ánh chính xác layout thực tế.
- Tối ưu hóa code bằng TypeScript mạnh mẽ với interface đầy đủ và type safety.
- Sử dụng các kỹ thuật tối ưu hiệu suất React như memo, useMemo và Array.from.
- Đảm bảo khả năng tùy biến cao thông qua props, giúp dễ dàng áp dụng cho nhiều loại bảng khác nhau.
- Tuân thủ nguyên tắc DRY (Don't Repeat Yourself) trong việc tạo skeleton các cột/hàng.
- Đảm bảo accessibility thông qua các thuộc tính ARIA phù hợp cho trạng thái loading.
