import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Public dev URL of the R2 bucket (SCRUM-76). Production custom domain
      // gets bound at the Fly.io cutover (SCRUM-55) — add its hostname here then.
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      // SigV4-authenticated R2 API endpoint. Not publicly reachable, but kept
      // for any legacy stored URLs that haven't been reconciled yet (SCRUM-78).
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      // Stub host used by the seed data until R2 assets land.
      {
        protocol: "https",
        hostname: "example.com",
      },
    ],
  },
};

export default nextConfig;
