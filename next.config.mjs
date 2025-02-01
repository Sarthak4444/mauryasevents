
export const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'media.istockphoto.com',
          pathname: '/**',
        },
      ],
    },
  };
  
  export default nextConfig;
  