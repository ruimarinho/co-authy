
/**
 * Module dependencies.
 */

import dir from 'require-dir';
import { flow, camelCase, capitalize, mapKeys } from 'lodash';

/**
 * Export asserts.
 */

export default mapKeys(dir('.'), (value, key) => flow(camelCase, capitalize)(key.replace('-assert', '')));
