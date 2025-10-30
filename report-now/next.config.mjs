/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "**", // optional, but recommended for completeness
      },
      {
        protocol: "https",
        hostname: "*.cloudinary.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;