const path = require("path");
const withTM = require("next-transpile-modules")(["@unisat/wallet-sdk"]); // Add the package here

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    UNISAT_OPENAPK_KEY:
      "26de7ec501a3b6ff3eadc0214ee46516606cd92cda0dbef50e35fad98a511148",
    FEE_ADDRESS: "bc1q2uun5ykztlw4kqcgdtm4xy0hx7tyvymdsfzdtz",
    FEE: 1000,
  },
  images: {
    domains: ["ordinalslite.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ordinalslite.com",
      },
    ],
  },
  webpack: function (config, options) {
    config.experiments = { asyncWebAssembly: true, layers: true };
    if (!options.isServer) {
      config.resolve.alias["@sentry/node"] = "@sentry/browser";
    }
    // Ensure node modules are transpiled
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules\/@unisat\/wallet-sdk/,
      use: {
        loader: "babel-loader",
        options: {
          presets: ["next/babel"], // this will use next.js's babel config
          plugins: [], // you can add plugins here if you need them
        },
      },
    });
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/unisat/:slug*",
        destination: "https://open-api.unisat.io/:slug*",
      },
      {
        source: "/unisat-testnet/:slug*",
        destination: "https://open-api-testnet.unisat.io/:slug*",
      },
      {
        source: "/mempool/:slug*",
        destination: "https://mempool.space/:slug*",
      },
    ];
  },
};

module.exports = withTM(nextConfig);
