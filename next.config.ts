import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
images:{
  remotePatterns: [
    {
      protocol: "https",
      hostname: "openweathermap.org",
      port: "",
    },
  ]
}

};

export default nextConfig;
