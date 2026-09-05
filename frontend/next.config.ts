import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://kanban-backend-eta.vercel.app/api/:path*",
      },
    ];
  },
};

export default nextConfig;
