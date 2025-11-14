import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true,
  turbopack: {}, // Silence Turbopack warning
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

export default pwaConfig(nextConfig);
