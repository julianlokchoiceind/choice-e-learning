# Task List: Khắc phục vấn đề UI/UX trong Choice E-Learning

## Phân tích hiện trạng
Dự án hiện đang gặp một số vấn đề về UI/UX:
1. Hình thumbnail không hiển thị đúng tỷ lệ
2. Sự không nhất quán trong layout header giữa các trang
3. Không thống nhất về việc hiển thị và vị trí các nút filter/search

## Task "Chuẩn hóa UI/UX giữa các trang quản lý":

### Task 1: "Khắc phục vấn đề hiển thị hình thumbnail"
- **Ngữ cảnh (Context)**: Hình thumbnail hiển thị không đúng tỷ lệ trong trang admin
- **Đường dẫn chính xác**: 
  - `d:\choice-e-learning\src\client\components\courses\CourseImage.tsx`
  - `d:\choice-e-learning\src\client\components\courses\CourseCard.tsx`
  - Các file admin sử dụng hiển thị thumbnail
- **Vị trí số dòng**: 35-40 trong CourseImage.tsx
- **Cách xử lý chi tiết**:
  1. Đảm bảo thuộc tính `object-fit: cover` được áp dụng cho tất cả các trường hợp hiển thị hình ảnh
  2. Kiểm tra và sửa CSS cho các trang admin đang hiển thị thumbnail không đúng
  3. Thêm các thuộc tính CSS cần thiết mà không làm thay đổi layout hiện tại
  ```jsx
  // Đảm bảo class object-cover được áp dụng nhất quán
  className="object-cover rounded-md w-full h-full"
  ```
  4. Kiểm tra xem trong trang admin có sử dụng component CourseImage hay không. Nếu không, thêm CSS tương tự:
  ```css
  .admin-course-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
  ```

### Task 2: "Chuẩn hóa loading state và thông báo lỗi"
- **Ngữ cảnh (Context)**: Các trang khác nhau đang hiển thị loading state và thông báo lỗi khác nhau
- **Đường dẫn chính xác**: `d:\choice-e-learning\src\app\admin\courses\page.tsx`
- **Vị trí số dòng**: ~150-200 (phần render bảng dữ liệu)
- **Cách xử lý chi tiết**:
  1. Cập nhật phần hiển thị loading state để sử dụng component `LoadingState` nhất quán với trang FAQs
  2. Giữ nguyên layout và vị trí các phần tử, chỉ cập nhật phần code xử lý loading
  3. Đảm bảo thông báo lỗi hiển thị thân thiện với người dùng
  ```jsx
  {isLoading ? (
    <tr>
      <td colSpan={5} className="text-center py-10">
        <LoadingState variant="table" message="Loading courses..." />
      </td>
    </tr>
  ) : error ? (
    <tr>
      <td colSpan={5} className="text-center py-10 text-gray-500">
        <p className="text-red-500 font-medium">An error occurred</p>
        <p className="text-sm mt-1">Please try again later.</p>
      </td>
    </tr>
  ) : courses.length === 0 ? (
    <tr>
      <td colSpan={5} className="text-center py-10 text-gray-500">
        <p>No courses found</p>
        <p className="text-sm mt-1">Try with different search terms.</p>
      </td>
    </tr>
  ) : (
    // Render courses as usual
  )}
  ```

### Task 3: "Khắc phục lỗi API 'data is undefined' trong trang Courses"
- **Ngữ cảnh (Context)**: Trang quản lý khóa học hiển thị lỗi `data is undefined` khi API trả về dữ liệu không đúng định dạng
- **Đường dẫn chính xác**: `d:\choice-e-learning\src\client\hooks\courses\useCoursesQuery.ts`
- **Vị trí số dòng**: 19-27
- **Cách xử lý chi tiết**:
  1. Cập nhật logic xử lý dữ liệu trả về để đảm bảo hoạt động với các định dạng dữ liệu khác nhau
  2. Thêm kiểm tra dữ liệu trước khi sử dụng để tránh lỗi undefined
  3. Chuẩn bị dữ liệu fallback khi API trả về lỗi
  ```typescript
  return useQuery({
    queryKey: ['courses', filters, isAdmin],
    queryFn: async () => {
      try {
        // Build query string for filtering
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.level) params.append('level', filters.level);
        if (filters.topics && Array.isArray(filters.topics) && filters.topics.length > 0) {
          filters.topics.forEach(topic => params.append('topics', topic));
        }
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.order) params.append('order', filters.order);
        
        const response = await axios.get(`${baseUrl}?${params.toString()}`);
        
        // Xử lý dữ liệu linh hoạt hơn
        if (response.data && response.data.success === true) {
          return response.data;
        } else if (response.data && response.data.data) {
          return response.data;
        } else if (Array.isArray(response.data)) {
          return {
            data: response.data,
            meta: {
              totalItems: response.data.length,
              totalPages: 1,
              page: filters.page || 1,
              limit: filters.limit || 10
            }
          };
        } else {
          console.warn('API response format is unexpected:', response.data);
          return {
            data: [],
            meta: {
              totalItems: 0,
              totalPages: 0,
              page: filters.page || 1,
              limit: filters.limit || 10
            }
          };
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.message || 'Failed to fetch courses');
        }
        throw new Error('An unexpected error occurred');
      }
    }
  });
  ```

## Lưu ý khi thực hiện task:

### Lưu ý chung:

1. **Không thay đổi layout**: Giữ nguyên layout, vị trí và chức năng hiện có của các nút và phần tử trên giao diện.

2. **Tập trung vào sửa lỗi**: Chỉ khắc phục các vấn đề cụ thể mà không làm thay đổi giao diện hay tính năng đang hoạt động ổn định.

3. **Đảm bảo tính nhất quán**: Chỉ chuẩn hóa phần loading state và thông báo lỗi giữa các trang mà không ảnh hưởng đến bố cục.

4. **Tương thích ngược**: Đảm bảo các thay đổi không phá vỡ chức năng hiện có.

### Lưu ý cụ thể cho từng task:

- **Task 1**: Chỉ thêm CSS cho thuộc tính `object-fit` mà không thay đổi kích thước hay vị trí của hình ảnh.

- **Task 2**: Giữ nguyên vị trí và layout của các phần tử tìm kiếm/lọc, chỉ cập nhật phần hiển thị loading state và thông báo lỗi.

- **Task 3**: Thay đổi cách xử lý dữ liệu bên trong hook mà không làm thay đổi cách component sử dụng hook.

## Kế hoạch dài hạn:

Sau khi hoàn thành các task trên để khắc phục lỗi ngay lập tức, cần lập kế hoạch dài hạn để chuẩn hóa UI/UX toàn diện:

1. **Tạo design system** thống nhất cho toàn bộ ứng dụng, bao gồm:
   - Typography (font, size, weight)
   - Color palette
   - Spacing
   - Component patterns (buttons, inputs, cards, etc.)

2. **Chuẩn hóa layout** giữa các trang quản lý:
   - Vị trí nhất quán cho các nút filter/sort
   - Cấu trúc nhất quán cho header
   - Cách hiển thị dữ liệu trong bảng

3. **Thống nhất thuật ngữ** sử dụng trong toàn bộ ứng dụng:
   - Danh sách các từ ngữ chuẩn cho các chức năng (filter, sort, search, etc.)
   - Định dạng nhất quán cho các tùy chọn trong dropdown

Các kế hoạch dài hạn này nên được thực hiện sau khi đã khắc phục các lỗi cấp bách để không làm gián đoạn trải nghiệm người dùng.
