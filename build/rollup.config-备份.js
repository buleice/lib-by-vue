import vuePlugin from 'rollup-plugin-vue';
import scss from 'rollup-plugin-scss';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import babel from '@rollup/plugin-babel';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import postcssImport from 'postcss-import';
import image from '@rollup/plugin-image';
import esbuild from 'rollup-plugin-esbuild';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import filesize from 'rollup-plugin-filesize';
import { visualizer } from 'rollup-plugin-visualizer';
import requireContext from 'rollup-plugin-require-context';

// 处理 apply 以及内置 mixin
// import tailwindcss from 'tailwindcss';
import { name } from '../package.json';

const {
  getAssetsPath, env, fsExistsSync, chalkConsole, isProduct,
} = require('../config/utils');
const { esDir } = require('../config/rollup.build.config');
const aliasConfig = require('../config/alias');
const { styleOutputPath, externalMap } = require('../config/index');
const banner = require('../config/banner');

const file = (type) => `dist/${name}.${type}.js`;

const overrides = {
  compilerOptions: { declaration: true },
  exclude: ['tests/**/*.ts', 'tests/**/*.tsx'],
};

export { name, file };
export default {
  input: 'src/index.ts', // 加载入口
  output: {
    name,
    file: file('esm'),
    format: 'es',
  },
  plugins: [
    // alias({
    //   entries: [{ find: '@', replacement: `${__dirname}/src/` }],
    // }),
    requireContext(),
    nodeResolve(),
    typescript({ tsconfigOverride: overrides }),
    vuePlugin(),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.vue'],
      babelHelpers: 'bundled',
    }),
    scss(),
    postcss({
      extensions: ['.css'],
      extract: true,
      plugins: [postcssImport()],
    }),
    commonjs({
      include: [
        'node_modules/**',
        'node_modules/**/*',
      ],
    }),
    replace({
      'process.env.NODE_ENV': isProduct ? '"production"' : '"development"',
      preventAssignment: true,
    }),
    json(),
    image({
      hash: false,
      output: getAssetsPath('/img'), // default the root
      extensions: /\.(png|jpg|jpeg|gif|svg)$/,
      limit: 8192, // default 8192(8k)
      exclude: [
        'node_modules/**',
        'node_modules/**/*',
      ],
    }),
    esbuild({
      minify: isProduct,
      target: 'es2015',
    }),
    alias({
      ...aliasConfig.alias,
      resolve: aliasConfig.resolve,
    }),

    // 开发模式下提供性能分析和服务器 以及文件大小分析
    !isProduct
      && visualizer({
        open: false,
      }),
    !isProduct
      && serve({
        open: true,
        contentBase: 'public',
        historyApiFallback: true,
        port: 8090,
      }),
    !isProduct && livereload({ watch: 'public' }),
    isProduct && filesize(),
  ],
  external: ['vue'],
};
