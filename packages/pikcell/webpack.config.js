const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

// Library build config (for use as npm package)
const libraryConfig = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: {
      name: 'pikcell',
      type: 'umd',
      umdNamedDefine: true
    },
    globalObject: 'this',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      'moxi': path.resolve(__dirname, '../core/src/index.ts'),
      'pixi.js': path.resolve(__dirname, '../../node_modules/pixi.js')
    }
  },
  externals: {
    'pixi.js': {
      commonjs: 'pixi.js',
      commonjs2: 'pixi.js',
      amd: 'pixi.js',
      root: 'PIXI'
    },
    'moxi': {
      commonjs: 'moxi',
      commonjs2: 'moxi',
      amd: 'moxi',
      root: 'moxi'
    }
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                declaration: true,
                declarationDir: './dist/types'
              }
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  devtool: 'source-map'
};

// Dev server config (for standalone development)
const devConfig = {
  mode: 'development',
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      'moxi': path.resolve(__dirname, '../core/src/index.ts'),
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
      template: './dev.html',
      filename: 'dev.html',
      title: 'PIKCELL - Pixel Sprite Editor',
      inject: false
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
    hot: true,
    open: '/dev.html'
  },
  devtool: 'source-map'
};

module.exports = isProduction ? libraryConfig : devConfig;
