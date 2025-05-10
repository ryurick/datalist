import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  headers: async () => [
    {
      source: "/(.*)", // すべてのパスに適用
      headers: [
        {
          key: "Cache-Control",
          value: "no-store", // キャッシュ無効化
        },
      ],
    },
  ],
};

export default nextConfig;
