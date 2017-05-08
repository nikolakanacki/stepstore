const debug = require('debug')('stepstore:step:remove');
const utils = require('../utils');

/**
 * REMOVE
 * Remove documents currently found in the buffer
 * @module stepstore-step-remove
 */

/**
 * @typedef stepstore-step-remove~data
 * @property {boolean} [keepBuffer=false] - Keep the removed documents in the buffer
 */

/**
 * Execute insert
 * @param {StepStoreServer}            store  - Store to execute on
 * @param {Array}                      buffer - The array of collected documents that will be returned to the client
 * @param {stepstore-step-remove~data} step   - Step data
 * @return {array} - Modified buffer
 */
module.exports.execute = function executeRemove(store, buffer, step) {
  buffer.forEach((doc) => {
    const collection = utils.ensureCollection(store.collections, doc._col);
    delete collection[doc._id];
  });
  debug('removed %s documents', buffer.length);
  return step.keepBuffer
  ? buffer
  : [];
};

module.exports.type = 'REMOVE';
