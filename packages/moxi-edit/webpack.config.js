const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleStatsWebpackPlugin } = require('bundle-stats-webpack-plugin');

const outDir = 'lib';

module.exports = (env, argv) => {
  const { mode = 'development' } = argv;

  const config = {
    mode,
    entry: './src/index.ts',
    output: {
      path: path.join(__dirname, outDir),
      filename: `index.js`,
      library: { name: 'moxi-edit', type: 'umd' }
    },
    devServer: {
      client: {
        overlay: false
      },
      port: 8788,
      static: {
        directory: path.join(__dirname, './'),
        publicPath: '/'
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?|.ts?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        }
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
      new HtmlWebpackPlugin({ template: path.join(__dirname, './index.html') }),
      new BundleStatsWebpackPlugin({
        stats: {
          assets: true, 
          chunks: true,
          modules: true,
          timings: true,
          version: true,
          warnings: true,
          colors: true, 
        }
      })
    ]
  }

  if (mode === 'development') {
    config.devtool = 'inline-source-map';
  }

  return config;
}