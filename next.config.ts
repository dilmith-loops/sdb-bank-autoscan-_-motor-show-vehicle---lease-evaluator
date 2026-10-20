import type { NextConfig } from 'next';

const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/sdb';
const basePath = rawBasePath === '' || rawBasePath === '/' ? '' : (rawBasePath.startsWith('/') ? rawBasePath : `/${rawBasePath}`).replace(/\/$/, '');

const nextConfig: NextConfig = {
  basePath,
  assetPrefix: basePath || undefined,
  // Ensure trailing slashes or subpath routes resolve smoothly
  trailingSlash: false,
};

export default nextConfig;

