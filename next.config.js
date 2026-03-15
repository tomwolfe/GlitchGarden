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
    {
      urlPattern: /^\/icons\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'pwa-icons-cache',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365,
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
    if (!isServer) {
      // Enable async WebAssembly for transformers.js on client side
      config.experiments = {
        ...config.experiments,
        asyncWebAssembly: true,
      };

      // Ensure transformers.js is properly bundled for workers
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        url: false,
      };

      // Exclude native bindings from client bundle
      config.module = {
        ...config.module,
        exprContextCritical: false,
      };

      // Ignore native modules that can't run in browser
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        /Critical dependency:/,
        /onnxruntime-node/,
      ];
    } else {
      // On server, exclude transformers.js since it's only used in browser
      config.externals = config.externals || [];
      if (!config.externals.includes('@huggingface/transformers')) {
        config.externals.push('@huggingface/transformers');
      }
    }

    return config;
  },
};

module.exports = withPWA(nextConfig);
