import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/?",
        destination: "/auth/login",
        permanent: false,
      },
      {
        source: "/",
        destination: "/auth/login",
        permanent: false,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://api-nexerp.somee.com/api/:path*",
      },
      {
        source: "/appHub/:path*",
        destination: "http://api-nexerp.somee.com/appHub/:path*",
      }
    ]
  }
};

export default nextConfig;
