/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Uncomment dòng dưới nếu deploy lên Firebase Hosting (static export)
  // output: 'export',
  images: {
    // Uncomment dòng dưới nếu dùng static export
    // unoptimized: true,
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
};

module.exports = nextConfig;




