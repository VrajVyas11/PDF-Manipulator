/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    resolveAlias: {
      canvas: './stubs/canvas-stub.js',  // Relative path only—no path.resolve() to avoid Windows abs path bugs in Turbopack
    },
  },
};

export default nextConfig;