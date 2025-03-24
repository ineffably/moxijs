const webpack = require('webpack');
const path = require('path');
const outDir = 'lib';
// const DtsBundleWebpack = require('dts-bundle-webpack');
// const rootDir = path.resolve(__dirname);

module.exports = (env, argv) => {
  const { mode = 'development' } = argv;
  const devtool = mode === 'production' ? false : 'inline-source-map';

  return {
    mode,
    devtool,
    entry: './src/index.ts',
    output: {
      path: path.join(__dirname, outDir),
      filename: `index.js`,
      library: { name: 'moxi', type: 'umd' }
    },
    externals: {
      'PIXI': 'pixi.js'
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
      // new DtsBundleWebpack({ options: {
      //   name: 'moxi',
      //   main: path.resolve(rootDir, '/lib/types/**/*.d.ts'),
      //   out: path.resolve(rootDir, '/lib/moxi.d.ts'),
      //   removeSource: true,
      //   outputAsModuleFolder: true
      // } })
    ]
  }
}