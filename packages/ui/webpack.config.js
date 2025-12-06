const path = require('path');
const outDir = 'lib';

module.exports = (env, argv) => {
  const { mode = 'development' } = argv;

  const config = {
    mode,
    entry: './src/index.ts',
    output: {
      path: path.join(__dirname, outDir),
      filename: `index.js`,
      library: { name: 'moxiUI', type: 'umd' },
      globalObject: 'this'
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
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js']
    },
    plugins: []
  }

  if (mode === 'development') {
    config.devtool = 'inline-source-map';
  }

  return config;
}
