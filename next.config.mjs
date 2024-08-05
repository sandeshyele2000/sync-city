/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "i.ytimg.com",
      "media.istockphoto.com",
    ],
  },
  async rewrites() {
    return [
      {
        source: '/socket.io/:path*',
        destination: '/api/socketio/:path*',
      },
    ];
  },
};

export default nextConfig;