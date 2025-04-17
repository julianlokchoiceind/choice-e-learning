/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com'
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me'
      }
    ]
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
  // Add assetPrefix for handling font loading
  assetPrefix: process.env.NODE_ENV === 'production' ? '/_next' : '',
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
    
    // Add rule for font files with proper file-loader configuration
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[hash:8].[ext]',
            publicPath: '/_next/static/media/',
            outputPath: 'static/media/',
            emitFile: !isServer,
          },
        },
      ],
    });

    // Fix for @vercel/og font loading
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@vercel/og': '@vercel/og',
      };
    }
    
    return config;
  },
};

module.exports = nextConfig; 