/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow HeyGen streaming avatar SDK to work correctly
  webpack: (config) => {
    config.externals = [...(config.externals || [])];
    return config;
  },
  // Required for HeyGen WebRTC streaming
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=*, microphone=*",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
