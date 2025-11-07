const webpack = require('webpack');
const path = require('path');
// const { BundleStatsWebpackPlugin } = require('bundle-stats-webpack-plugin');
const outDir = 'lib';

module.exports = (env, argv) => {
  const { mode = 'development' } = argv;

  const config = {
    mode,
    entry: './src/index.ts',
    output: {
      path: path.join(__dirname, outDir),
      filename: `index.js`,
      library: { name: 'moxi', type: 'umd' }
    },
    externals: {
      'pixi.js': {
        commonjs: 'pixi.js',
        commonjs2: 'pixi.js',
        amd: 'pixi.js',
        root: 'PIXI'
      }
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
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
      // new BundleStatsWebpackPlugin({
      //   stats: {
      //     assets: true, 
      //     chunks: true,
      //     modules: true,
      //     timings: true,
      //     version: true,
      //     warnings: true,
      //     colors: true, 
      //   }
      // })
    ]
  }

  if (mode === 'development') {
    config.devtool = 'inline-source-map';
  }

  return config;
}