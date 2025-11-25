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
      // Use local moxi source for development so webpack can properly handle externals
      'moxi': path.resolve(__dirname, '../moxi/src/index.ts'),
      // Use local pikcell source for development
      'pikcell': path.resolve(__dirname, '../pikcell/src/index.ts')
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
      },
      {
        resourceQuery: /raw/,
        type: 'asset/source'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      title: 'Moxi Examples',
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
    port: 9000,
    hot: true
  },
  devtool: 'source-map'
};

