/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow mobile phones on local network to fetch dev resources without crashing
  allowedDevOrigins: [
    '192.168.1.2', '192.168.1.3', '192.168.1.4', '192.168.1.5'
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
