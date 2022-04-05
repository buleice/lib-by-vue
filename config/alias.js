const utils = require('./utils');

module.exports = {
  resolve: ['.js', '.ts', 'jsx', 'tsx', '.vue', '.json'],
  alias: {
    '@': utils.resolve('../src'),
    '@component': utils.resolve('../src/component'),
    '@examples': utils.resolve('../src/examples'),
  },
};
