const webpack = require('webpack');
const path = require('path');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const outDir = 'lib';

module.exports = (env, argv) => {
  const { mode = 'development' } = argv;

  return ({
    mode,
    entry: './src/index.ts',
    output: {
      path: path.join(__dirname, outDir),
      filename: `index.js`,
      library: { name: 'code4', type: 'umd' }
    },
    externals: {
      react: {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react'
      },
      'react-dom': {
        root: 'ReactDOM',
        commonjs2: 'react-dom',
        commonjs: 'react-dom',
        amd: 'react-dom'
      }
    },
    module: {
      noParse: [require.resolve("typescript/lib/typescript.js")],
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
      plugins: [new TsconfigPathsPlugin()],
      extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
      new MonacoWebpackPlugin({
        languages: ['javascript', 'typescript', 'json', 'css', 'html']
      }),
    ]
  })
}
