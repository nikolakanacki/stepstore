const debug = require('debug')('stepstore:step:clear');

/**
 * CLEAR
 * Clear current buffer array
 * @module stepstore-step-clear
 */

/**
 * Execute insert
 * @param {StepStoreServer} store  - Store to execute on
 * @param {Array}           buffer - The array of collected documents that will be returned to the client
 * @return {Array} - Modified buffer
 */
module.exports.execute = function executeClear(store, buffer) {
  debug('clearing %s documents from the buffer', buffer.length);
  return [];
};

module.exports.type = 'CLEAR';
