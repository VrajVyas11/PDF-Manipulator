/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/upload',
          destination: 'http://localhost:3000/upload',
        },
      ];
    },
  };
  
  export default nextConfig;
  