import uglify from 'rollup-plugin-uglify';
import baseConfig from './rollup.config.base';

baseConfig.plugins.push(uglify());

export default baseConfig;
