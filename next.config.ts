import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    staleTimes: {
      // Reuse recently visited pages and fully prefetched sidebar destinations.
      // Server Actions invalidate affected routes when the user saves changes.
      dynamic: 120,
      static: 120,
    },
  },
};

export default nextConfig;
