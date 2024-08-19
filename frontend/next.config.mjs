/** @type {import('next').NextConfig} */
const nextConfig = {
	async redirects() {
		return [
			{
				source: "/",
				destination: "/groceries",
				permanent: true,
			},
		];
	},
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: `${process.env.BASE_API_URL}/:path*`,
			},
		];
	},
	env: {
		BASE_API_URL: process.env.BASE_API_URL,
	},
};

export default nextConfig;
