import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export -> deploys to Firebase Hosting as plain HTML/CSS/JS.
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,
  // This project sits next to the Expo app (which has its own lockfile);
  // pin the tracing root to the website so Next doesn't warn/guess.
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
