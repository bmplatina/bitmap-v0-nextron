import { NextConfig } from "next";

const config: NextConfig = {
  output: "export",
  distDir: process.env.NODE_ENV === "production" ? "../app" : ".next",
  trailingSlash: true,
  allowedDevOrigins: ["api.prodbybitmap.com"],
  images: {
    unoptimized: true,
  },
  // webpack: (config) => {
  //   return config;
  // },
};

export default config;
