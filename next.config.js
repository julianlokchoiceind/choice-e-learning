/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'randomuser.me'],
  },
  // Tắt tất cả console log kể cả từ NextAuth và Fast Refresh
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],  // Chỉ giữ lại console.error và console.warn
    },
  },
  logging: {
    fetches: {
      fullUrl: false,
    },
    incomingRequests: false,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'fs', 'net', and other Node.js builtins on the client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        dns: false,
        tls: false,
        child_process: false,
        tty: false
      };
    }
    return config;
  },
};

module.exports = nextConfig; 