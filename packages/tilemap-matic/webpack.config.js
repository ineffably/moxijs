const path = require('path');

module.exports = (env, argv) => {
  const mode = argv.mode || 'production';

  return {
    mode,
    entry: './src/main.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'bundle.js',
      clean: true
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
      alias: {
        '@moxijs/core': path.resolve(__dirname, '../core/src/index.ts'),
        '@moxijs/ui': path.resolve(__dirname, '../ui/src/index.ts'),
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
    devServer: {
      static: {
        directory: path.join(__dirname),
        watch: true
      },
      compress: true,
      port: 9002,
      hot: true
    },
    devtool: mode === 'production' ? 'source-map' : 'eval-source-map'
  };
};
