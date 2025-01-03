/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false, // Stub the 'canvas' module
      };
      return config;
    },
  };
  
export default nextConfig;
