import type { NextConfig } from "next";

// Главная собирается в статический HTML (out/index.html + out/_next/),
// scripts/install-home.mjs кладёт их в корень сайта рядом с картами.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  poweredByHeader: false,
  trailingSlash: true,
};

export default nextConfig;
