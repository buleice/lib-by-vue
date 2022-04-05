const vuePlugin = require('rollup-plugin-vue');
const replace = require('@rollup/plugin-replace');
const babel = require('@rollup/plugin-babel');
const typescript = require('rollup-plugin-typescript2');
const commonjs = require('@rollup/plugin-commonjs');
const postcss = require('rollup-plugin-postcss');
const postcssImport = require('postcss-import');
const image = require('@rollup/plugin-image');
const serve = require('rollup-plugin-serve');
const livereload = require('rollup-plugin-livereload');
const filesize = require('rollup-plugin-filesize');
const scss = require('rollup-plugin-scss');
const alias = require('@rollup/plugin-alias');
const json = require('@rollup/plugin-json');
const esbuild = require('rollup-plugin-esbuild');
const visualizer = require('rollup-plugin-visualizer');
const requireContext = require('rollup-plugin-require-context');
const terser = require('rollup-plugin-terser');
const nodeResolve = require('@rollup/plugin-node-resolve');

// 处理 apply 以及内置 mixin
// import tailwindcss from 'tailwindcss';

const rollup = require('rollup');
const fs = require('fs');
const {
  getAssetsPath, env, fsExistsSync, chalkConsole, isProduct,
} = require('./utils');
const { esDir } = require('./rollup.build.config');

const isEs = (fmt) => fmt === esDir;
const aliasConfig = require('./alias');
const { styleOutputPath, externalMap } = require('./index');
const banner = require('./banner');

const overrides = {
  compilerOptions: { declaration: true },
  exclude: ['tests/**/*.ts', 'tests/**/*.tsx'],
};

function createPlugins({ min } = {}) {
  const plugins = [
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
  ];
  if (min) {
    plugins.push(terser());
  }
  return plugins;
}

/**
 * 输入js文件
 * @param {*} param0
 */
async function write({
  output, file, fileName, format, fullName,
} = {}) {
  // eslint-disable-next-line no-restricted-syntax
  for (const { isAsset, code, source } of output) {
    if (isAsset) {
      const cssFileName = `${fileName}.css`;
      const filePath = isEs(format)
        ? getAssetsPath(`/${esDir}/${cssFileName}`)
        : getAssetsPath(`/${styleOutputPath}/${cssFileName}`);

      // eslint-disable-next-line no-unused-expressions
      !fsExistsSync(filePath) && fs.writeFileSync(filePath, banner + source.toString());
    } else {
      const filePath = isEs(format) ? getAssetsPath(`/${esDir}/${fullName}`) : file;
      const codeSource = code.replace(/\s?const\s/g, ' var ');
      fs.writeFileSync(filePath, banner + codeSource);
    }
  }
}
/**
 * 打包入口
 * @param {*} config
 */
async function buildEntry(config) {
  const {
    output, suffix, input, format, moduleName,
  } = config;

  const inputOptions = {
    input,
    external: Object.keys(externalMap),
    plugins: createPlugins(config),
  };
  const fullName = output + suffix;
  const file = getAssetsPath(fullName);
  const outOptions = {
    // dir: getAssetsPath(),
    file,
    format,
    name: moduleName,
    // exports: 'named',
    globals: externalMap,
    // entryFileNames: file
  };
  const bundle = await rollup.rollup(inputOptions);
  const { output: outputData } = await bundle.generate(outOptions);

  await write({
    output: outputData, fileName: output, format, fullName, file,
  });
}
/**
 * 打包
 * @param {*} config
 */
function build(builds) {
  let buildCount = 0;
  const total = builds.length;
  const next = async () => {
    chalkConsole.building(buildCount + 1, total);
    await buildEntry(builds[buildCount]);
    buildCount += 1;
    if (buildCount < total) {
      next();
    } else {
      chalkConsole.success();
    }
  };
  next();
}

module.exports = {
  build,
};
