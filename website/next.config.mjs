/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export -> deploys to Firebase Hosting as plain HTML/CSS/JS.
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
