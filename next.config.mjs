/**
 * Next.js Configuration
 * 
 * This configuration file controls various aspects of the Next.js application:
 * - Remote image patterns: Defines allowed external image sources
 * - Console logging: Controls which console statements are preserved in production
 * - Asset handling: Configures how static assets are served
 * - Webpack customizations: Handles font loading and Node.js polyfills
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image configuration for remote sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '**',
      },
    ],
  },
  
  // Console log configuration - removes all logs except errors and warnings
  compiler: {
    removeConsole: {
      exclude: ['error', 'warn'],
    },
  },
  
  // Logging configuration for Next.js
  logging: {
    fetches: {
      fullUrl: false,
    },
    incomingRequests: false,
  },
  
  // Asset prefix configuration for production environments
  assetPrefix: process.env.NODE_ENV === 'production' ? '/_next' : '',
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve Node.js builtins on the client side
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

export default nextConfig;