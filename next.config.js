/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export: this app has no backend/API routes (see .goosehints),
  // and the S3 + CloudFront deploy target can only serve static files.
  // (headers() has no effect under 'export' — CloudFront serves the security
  // headers instead, see infra/cloudfront-headers policy if one is added.)
  output: 'export',
};

module.exports = nextConfig;
