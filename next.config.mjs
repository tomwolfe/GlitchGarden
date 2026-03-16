/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  webpack: (config) => {
    config.resolve.fallback = { 
      fs: false, 
      path: false, 
      crypto: false 
    };
    return config;
  },
  trailingSlash: true,
}

export default nextConfig;
