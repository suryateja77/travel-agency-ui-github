const path = require('path')
const HtmlWebPackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'assets/js/[name].[fullhash].js',
    assetModuleFilename: 'includes/[hash][ext][query]',
    publicPath: '/',
  },
  optimization: {
    usedExports: true,
    splitChunks: {
      chunks: 'all',
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
      },
      {
        test: /\.(png|jp(e*)g|svg|webp|gif)$/,
        type: 'asset/resource',
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          sourceMaps: true,
          inputSourceMap: true,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json', '...'],
    alias: {
      '@base': path.resolve(__dirname, './src/base'),
      '@components': path.resolve(__dirname, './src/components'),
      '@data': path.resolve(__dirname, './src/data'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@api': path.resolve(__dirname, './src/api'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@config': path.resolve(__dirname, './src/config'),
      '@mock': path.resolve(__dirname, './src/mock'),
      '@context': path.resolve(__dirname, './src/context'),
      '@images': path.resolve(__dirname, './src/images'),
      '@state': path.resolve(__dirname, './src/state'),
      '@types': path.resolve(__dirname, './src/types'),
    },
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './index.html',
      filename: './index.html',
    }),
  ],
}
