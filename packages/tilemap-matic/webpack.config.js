const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';

// Library build config (for use as npm package)
const libraryConfig = {
  mode: 'production',
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: {
      name: 'TileMapMatic',
      type: 'umd',
      umdNamedDefine: true
    },
    globalObject: 'this',
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
    },
    '@moxijs/ui': {
      commonjs: '@moxijs/ui',
      commonjs2: '@moxijs/ui',
      amd: '@moxijs/ui',
      root: 'moxiUI'
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

// Dev server / app build config (for standalone development and GitHub Pages)
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
  devtool: 'source-map'
};

module.exports = (env, argv) => {
  // If mode is explicitly set via CLI (e.g., --mode production), use that
  // Otherwise fall back to NODE_ENV
  const mode = argv?.mode || (isProduction ? 'production' : 'development');

  if (mode === 'production') {
    return libraryConfig;
  }
  return devConfig;
};
