/** @type {import('next').NextConfig} */
const nextConfig = {
	images: {
		remotePatterns: [
			{ protocol: "https", hostname: "res.cloudinary.com" },
			{ protocol: "https", hostname: "*.cloudinary.com" },
		],
		// Back-compat domains option in case remotePatterns pattern matching differs per env
		domains: ["res.cloudinary.com"],
	},
};

export default nextConfig; // if using ESM (.mjs / .ts)
// module.exports = nextConfig; // if using CJS (.js)
