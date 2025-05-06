import axios from 'axios';

// Tạo instance của axios với các cấu hình mặc định
const apiClient = axios.create({
  baseURL: '',  // Để trống baseURL vì sẽ sử dụng relative URLs
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout sau 30 giây
  timeout: 30000,
});

// Interceptor để xử lý request
apiClient.interceptors.request.use(
  (config) => {
    // Có thể thêm logic xử lý request ở đây, như thêm token
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
apiClient.interceptors.response.use(
  (response) => {
    // Trả về response.data trực tiếp
    return response;
  },
  (error) => {
    // Xử lý lỗi response
    return Promise.reject(error);
  }
);

export default apiClient;
