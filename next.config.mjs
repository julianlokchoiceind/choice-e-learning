/**
 * Next.js Configuration
 * 
 * This configuration file controls various aspects of the Next.js application:
 * - Remote image patterns: Defines allowed external image sources
 * - Console logging: Controls which console statements are preserved in production
 * - Asset handling: Configures how static assets are served
 * - Webpack customizations: Handles font loading and Node.js polyfills
 */

// Node.js built-in modules first
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Third-party modules next
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import webpack from 'webpack';

// Local imports last (if any)
// import { something } from '@/somewhere';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
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
    domains: [
      'via.placeholder.com',
      'randomuser.me',
      'localhost',
      'picsum.photos'
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
      // Polyfills for Node.js modules in browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        events: 'events',
        stream: 'stream-browserify',
        buffer: 'buffer',
        util: 'util',
        path: 'path-browserify',
        process: 'process/browser'
      };

      // Add ProvidePlugin to provide global modules
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );
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