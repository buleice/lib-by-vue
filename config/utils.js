// eslint-disable-next-line import/no-import-module-exports
import { name } from '../package.json';

const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const { outputPath } = require('./index');

module.exports = {
  name,
  isProduct: ['production', 'prod'].includes(process.env.NODE_ENV),
  env: process.env.NODE_ENV,
  file(type) {
    return `dist/${name}.${type}.js`;
  },
  getAssetsPath(_path = '.') {
    return path.posix.join(outputPath, _path);
  },
  resolve(_path) {
    return _path ? path.resolve(__dirname, _path) : path.resolve(__dirname, '..', outputPath);
  },
  fsExistsSync: (_path) => {
    try {
      fs.accessSync(_path, fs.F_OK);
    } catch (e) {
      return false;
    }
    return true;
  },
  chalkConsole: {
    success: () => {
      console.log(chalk.green('========================================='));
      console.log(chalk.green('========打包成功(build success)!========='));
      console.log(chalk.green('========================================='));
    },
    building: (index, total) => {
      console.log(chalk.blue(`正在打包第${index}/${total}个文件...`));
    },
  },
};
