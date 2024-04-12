/** @type {import('next').NextConfig} */

const withAntdLess = require("next-plugin-antd-less");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
const pluginAntdLess = withAntdLess({
  lessVarsFilePath: "styles/variables.less",
});

const nextComposePlugins = require("next-compose-plugins");
const { withPlugins } = nextComposePlugins.extend(() => ({}));

const { theme } = require("antd/lib");
const { convertLegacyToken } = require("@ant-design/compatible/lib");

const { defaultAlgorithm, defaultSeed } = theme;

const mapToken = defaultAlgorithm(defaultSeed);
const v4Token = convertLegacyToken(mapToken);

const nextPlugins = [
  [pluginAntdLess],
  withBundleAnalyzer,
];

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  compiler: {
    styledComponents: true
  },
  loader: "less-loader",
  options: {
    lessOptions: {
      modifyVars: v4Token,
    },
  },
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  },
  transpilePackages: ["@zkls/editor"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.s3.amazonaws.com',
      },
    ],
  }
};

module.exports = withPlugins(nextPlugins, nextConfig);
