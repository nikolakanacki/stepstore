const debug = require('debug')('stepstore:step:update');
const utils = require('../utils');
const isUndefined = require('lodash/isUndefined');
const isObject = require('lodash/isObject');

/**
 * UPDATE
 * Update documents from the buffer. If the buffer has not been removed by
 * any of the previous steps, documents found in the buffer are referenced from
 * the collection, and will update in both places.
 * @module stepstore-step-update
 */

/**
 * @typedef stepstore-step-update~data
 * @property {string}  collection - Collection to query
 * @property {boolean} upsert     - Insert new document if non exist
 */

/**
 * Execute insert
 * @param {StepStoreServer}            store  - Store to execute on
 * @param {Array}                      buffer - The array of collected documents that will be returned to the client
 * @param {stepstore-step-update~data} step   - Step data
 * @param {Date}                       date   - Date to use when accessing documents
 * @return {array} - Modified buffer
 */
module.exports.execute = function executeUpdate(store, buffer, step, date) {
  if (!isObject(step.update)) {
    throw new Error(`Expected an update object but got "${step.update}"`);
  }
  if (
    !isUndefined(step.update._id) ||
    !isUndefined(step.update._col) ||
    !isUndefined(step.update._dist)
  ) {
    throw new Error('Keys "_id" and "_col" are forbidden');
  }
  if (!buffer.length) {
    if (!step.upsert) {
      debug('buffer is empty and upsert is not specified');
      return buffer;
    }
    const collection = utils.ensureCollection(
      store.collections,
      step.collection,
    );
    utils.addToCollection(collection, step.update, step.collection);
  } else {
    buffer.forEach(doc => utils.updateDocument(doc, step.update, date));
  }
  return buffer;
};

module.exports.type = 'UPDATE';
