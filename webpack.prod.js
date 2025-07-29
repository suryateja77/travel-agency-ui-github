const { merge } = require('webpack-merge')
const { DefinePlugin } = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const CompressionPlugin = require('compression-webpack-plugin')
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const commonConfig = require('./webpack.common')

const withBundleAnalyzer = process.env.NODE_ENV === 'bundleAnalyze'
const withMock = process.env.NODE_ENV === 'mock'

const prodConfig = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      IS_MOCK: withMock,
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/css/styles.[name].[fullhash].css',
    }),
    withBundleAnalyzer && new BundleAnalyzerPlugin(),
    new CompressionPlugin(),
    withMock && new CopyPlugin({
      patterns: [
        { from: "public", to: "public" },
        { from: "src/mocks", to: "mocks" },
        { from: "public/mockServiceWorker.js", to: "mockServiceWorker.js" },
      ],
    }),
  ],
}

module.exports = merge(commonConfig, prodConfig)
