/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    // allow loading images from Cloudinary and the project's CDN
    domains: ['res.cloudinary.com', 'cdn.okpups.com'],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'cdn.okpups.com', pathname: '/**' }
    ]
  }
};

export default nextConfig;
