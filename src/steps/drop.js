const debug = require('debug')('stepstore:step:drop');
const utils = require('../utils');

/**
 * DROP
 * Drop single collection
 * @module stepstore-step-drop
 */

/**
 * @typedef stepstore-step-drop~data
 * @property {string} collection - Collection to drop
 */

/**
 * Execute drop
 * @param {StepStoreServer}          store  - Store to execute on
 * @param {Array}                    buffer - The array of collected documents that will be returned to the client
 * @param {stepstore-step-drop~data} step   - Step data
 * @return {array} - Modified buffer
 */
module.exports.execute = function executeDrop(store, buffer, step) {
  utils.validateCollectionName(step.collection);
  const collections = store.collections;
  debug('dropping collection %s', step.collection);
  delete collections[step.collection];
  return buffer;
};

module.exports.type = 'DROP';
