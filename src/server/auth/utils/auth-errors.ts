// src/server/auth/utils/auth-errors.ts

/**
 * Các lỗi xác thực thường gặp
 */
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Thông tin đăng nhập không chính xác',
  USER_NOT_FOUND: 'Không tìm thấy người dùng',
  EMAIL_EXISTS: 'Email đã được sử dụng',
  UNAUTHORIZED: 'Bạn không có quyền truy cập',
  SERVER_ERROR: 'Lỗi máy chủ, vui lòng thử lại sau',
  INVALID_TOKEN: 'Token không hợp lệ hoặc đã hết hạn',
  PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',
  WEAK_PASSWORD: 'Mật khẩu không đủ mạnh',
  ACCOUNT_LOCKED: 'Tài khoản đã bị khóa',
  VERIFICATION_REQUIRED: 'Cần xác minh email trước khi đăng nhập',
};

export class AuthError extends Error {
  code: string;
  
  constructor(code: keyof typeof AUTH_ERRORS) {
    super(AUTH_ERRORS[code]);
    this.name = 'AuthError';
    this.code = code;
  }
}