const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      // Use local moxi build
      'moxi': path.resolve(__dirname, '../moxi/lib/index.js')
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'Moxi Examples'
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname),
      watch: true
    },
    devMiddleware: {
      publicPath: '/'
    },
    compress: true,
    port: 9000,
    hot: true
  },
  devtool: 'source-map'
};

