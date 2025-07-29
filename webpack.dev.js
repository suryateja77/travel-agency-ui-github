const { HotModuleReplacementPlugin } = require('webpack')
const { merge } = require('webpack-merge')
const commonConfig = require('./webpack.common')

const devConfig = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    port: process.env.PORT || 9090,
    host: '0.0.0.0',
    historyApiFallback: true, // Serve index.html in case of any 404 responses.
    compress: true, // Enable G-zip compression for everything served
    hot: true,
    open: false,
    proxy: [{
      context: ['/api'],
      target: 'http://localhost:8080',
      pathRewrite: {
        '^/api': ''
      },
      secure: true,
      changeOrigin: true
    }],
  },
  module: {
    rules: [
      {
        test: /\.s?css$/,
        use: [
          {
            loader: 'style-loader',
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
    new HotModuleReplacementPlugin()
  ],
}

module.exports = merge(commonConfig, devConfig)
