const path = require('path');
const outDir = 'lib';

module.exports = (env, argv) => {
  const { mode = 'development' } = argv;

  const config = {
    mode,
    entry: './src/index.ts',
    output: {
      path: path.join(__dirname, outDir),
      filename: 'index.js',
      library: { name: 'miniGui', type: 'umd' }
    },
    externals: {
      'pixi.js': {
        commonjs: 'pixi.js',
        commonjs2: 'pixi.js',
        amd: 'pixi.js',
        root: 'PIXI'
      },
      '@moxijs/core': {
        commonjs: '@moxijs/core',
        commonjs2: '@moxijs/core',
        amd: '@moxijs/core',
        root: 'moxi'
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?|.ts?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        }
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    plugins: []
  };

  if (mode === 'development') {
    config.devtool = 'inline-source-map';
  }

  return config;
};
