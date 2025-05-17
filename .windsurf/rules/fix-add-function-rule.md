---
trigger: always_on
description: 
globs: 
---
## 1. Vấn đề ưu tiên cho mỗi lần phản hồi:

- Nếu là 1 phiên chat hoàn toà bất cứ vấn đề gì hãy sweep toàn bộ source code/codebase để hiểu được cấu trúc và hiện trạng codebase của tôi để biết đường mà trả lời tôi cho chính xác (CỰC KỲ ƯU TIÊN).

## 2. Khi tôi đề cập đến việc phát triển hay fix lỗi hay triển khai 1 tính năng hay vấn đề nào đó, vui lòng tuân thủ nghiêm ngặt (CỰC KỲ ƯU TIÊN):

- Tiến hành sweep source code/codebase liên quan đến vấn đề mà tôi đề cập đến để hiểu rõ hiện trạng vấn đề đó có được xử lý hay cập nhật mới nhất chưa. Từ đó biết được source code/codebase hiện đang có những thư mục, file, logic nào có thể sử dụng. Từ đó khi đưa ra giải pháp cho từng Task có thể tránh trùng lặp code, tạo thư mục, file dư thừa không cần thiết. Sau đó:

- Luôn tuân thủ nghiêm ngặt mọi nguyên tắc và tiêu chuẩn của tài liệu đính kèm trong [new-fuction-development-structure.mdc](mdc:.cursor/rules/new-fuction-development-structure.mdc).

- List ra Task tổng và sau đó chia nhỏ từng task một (luôn liệt kê task ưu tiên cao đến thấp trong task tổng đó), ghi rõ nội dung chi tiết cách xử lý cụ thể(đường dẫn, tên file, cách xử lý...) của task đó để tech lead giao cho dev xử lý task. Trong quá trình fix hay di chuyển file code thì lưu ý **không cần code tương thích ngược** với cách hoạt động cũ, **tự do loại bỏ code không cần thiết để tối ưu hóa trang**. Cấu trúc phản hồi của khi giao Task:
Task "name":
...
Task 1: "Vấn đề cần xử lý..."
- Ngữ cảnh (Context) nào/đường dẫn chính xác:
- Vị trí số dòng:
- Cách xử lý chi tiết:
...
Task 2: "Vấn đề cần xử lý..."
- Ngữ cảnh (Context) nào/đường dẫn chính xác:
- Vị trí số dòng:
- Cách xử lý chi tiết:

Lưu ý khi thực hiện task:
Lưu ý chung:

1. Tuân thủ Domain-Driven Design: Tổ chức code theo domain (courses) và tránh tạo thư mục lồng nhau không cần thiết.

2. Alias Imports: Luôn sử dụng alias imports (@/client/..., @/server/..., @/shared/...), tránh dùng relative imports.

3. Export Index Files: Luôn cập nhật file index.ts trong các thư mục để export components, hooks hoặc types mới.

4. Error Handling: Xử lý đầy đủ các trường hợp lỗi khi loading hình ảnh.

5. Type Safety: Đảm bảo định nghĩa types rõ ràng cho props và các giá trị trả về.

6. Không tương thích ngược: Loại bỏ code cũ không cần thiết, không phải giữ tương thích với code hiện tại đã lỗi thời.

7. Tránh code dư thừa: Tập trung vào giải pháp tối ưu và xóa code không cần thiết nếu có.

Lưu ý cụ thể cho từng task:

Task 1:
...

Task 2:
...

## Note:

- Không tự ý fix bug hay writing code khi chưa được sự cho phép của tôi. Chỉ list ra từng task cần làm.

- Luôn kích hoạt MCP tool quét mới codebase sau mỗi lần vấn đề chưa được giải quyết hoặc vấn đề vẫn còn tồn tại.

- Trước khi đưa ra Task cần làm phải bàn bạc thảo luận và tìm ra lỗi chính xác ở đâu mới đưa ra task cụ thể

- Phản hồi bằng tiếng việt/tiếng anh