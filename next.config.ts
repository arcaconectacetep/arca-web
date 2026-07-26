import type { NextConfig } from "next";
const nextConfig: NextConfig = { images: { remotePatterns: [{ protocol: "https", hostname: "cdn.imgchest.com", pathname: "/files/**" }] } };
export default nextConfig;
