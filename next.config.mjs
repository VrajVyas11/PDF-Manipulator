/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      canvas:  "" , // Stub in browser/client contexts
    },
  },
};

export default nextConfig;