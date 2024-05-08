/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const withAntdLess = require("next-plugin-antd-less");
const { theme } = require("antd/lib");
const { convertLegacyToken } = require("@ant-design/compatible/lib");
const { defaultAlgorithm, defaultSeed } = theme;
const mapToken = defaultAlgorithm(defaultSeed);
const v4Token = convertLegacyToken(mapToken);
withAntdLess({
  lessVarsFilePath: "styles/variables.less",
  modifyVars: v4Token,
});

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  compiler: {
    styledComponents: true
  },
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.**.amazonaws.com',
      }
    ],
  }
};

module.exports = (_phase, { defaultConfig }) => {
  return [withAntdLess, withBundleAnalyzer].reduce(
    (config, plugin) => plugin(config),
    nextConfig,
  );
};
