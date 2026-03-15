/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/cdn\.huggingface\.co\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'transformers-models-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /^https:\/\/unpkg\.com\/@huggingface\/transformers.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'transformers-cdn-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/npm\/@huggingface\/transformers.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'transformers-jsdelivr-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Required for PWA offline support
  },
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      // Exclude transformers.js from server bundle
      config.externals = config.externals || [];
      if (!config.externals.includes('@huggingface/transformers')) {
        config.externals.push('@huggingface/transformers');
      }
    }
    
    // Enable async WebAssembly for transformers.js
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    return config;
  },
};

module.exports = withPWA(nextConfig);
