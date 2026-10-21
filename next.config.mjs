import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // There is another lockfile higher up in the scratch workspace. Pin tracing
  // to this app so Vercel/standalone builds do not copy unrelated files.
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
