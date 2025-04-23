import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
	/* config options here */
	reactStrictMode: true,
	output: "standalone",
	outputFileTracingRoot: path.join(__dirname, "../../"),
	experimental: {},
};

export default nextConfig;
