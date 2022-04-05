// eslint-disable-next-line import/no-import-module-exports
import { name, version } from '../package.json';

module.exports = '/*'
  + `* ${name} v${version}`
  + ` * Copyright © 2022-${new Date().getFullYear()} bulueice`
  + ' * Released under the MIT License.'
  + ' */\n';
