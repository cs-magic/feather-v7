/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  distDir: process.env.DIST ?? ".next",
}

module.exports = nextConfig
