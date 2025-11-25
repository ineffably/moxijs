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
      'moxi': path.resolve(__dirname, '../moxi/src/index.ts'),
      'pixi.js': path.resolve(__dirname, '../../node_modules/pixi.js')
    }
  },
  externalsType: 'window',
  externals: {
    'pixi.js': 'PIXI'
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
      title: 'PIKCELL - Pixel Sprite Editor',
      inject: 'body',
      scriptLoading: 'blocking'
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
    port: 9001,
    hot: true
  },
  devtool: 'source-map'
};
