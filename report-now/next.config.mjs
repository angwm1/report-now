/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // either this:
    domains: ["res.cloudinary.com"],
    // or the more explicit version:
    // remotePatterns: [
    //   { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" }
    // ],
  },
};

export default nextConfig; // if using ESM (.mjs / .ts)
// module.exports = nextConfig; // if using CJS (.js)
