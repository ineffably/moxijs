const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env, argv) => ({
  mode: argv.mode || 'development',
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
      'moxi': path.resolve(__dirname, '../core/src/index.ts'),
      '@moxijs/core': path.resolve(__dirname, '../core/src/index.ts'),
      // Use local pikcell source for development
      'pikcell': path.resolve(__dirname, '../pikcell/src/index.ts'),
      // Use local tilemap-matic source for development
      'tilemap-matic': path.resolve(__dirname, '../tilemap-matic/src/index.ts'),
      '@moxijs/tilemap-matic': path.resolve(__dirname, '../tilemap-matic/src/index.ts'),
      // Use local mini-gui for development
      '@moxijs/mini-gui': path.resolve(__dirname, '../mini-gui/src/index.ts')
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
      template: './index.html',
      title: 'MoxiJS Examples',
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
});

