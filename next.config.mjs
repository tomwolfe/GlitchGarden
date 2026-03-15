/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for @xenova/transformers to work in some environments
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'sharp$': false,
      'onnxruntime-node$': false,
    };
    return config;
  },
};

export default nextConfig;
