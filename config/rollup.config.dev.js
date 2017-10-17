import baseConfig from './rollup.config.base';

baseConfig.watch = {
  exclude: 'node_modules/**'
};

export default baseConfig;
