const debug = require('debug')('stepstore:step:insert');
const utils = require('../utils');
const isObject = require('lodash/isObject');
const isArray = require('lodash/isArray');

/**
 * INSERT
 * Insert specified documents to a single collection
 * and possibly populate the buffer
 * @module stepstore-step-insert
 */

/**
 * @typedef stepstore-step-insert~data
 * @property {string}  collection         - Collection to insert the documents to
 * @property {array}   documents          - Documents to insert
 * @property {boolean} [addToBuffer=true] - Should inserted documents be added to the buffer
 */

/**
 * Execute insert
 * @param {StepStoreServer}            store  - Store to execute on
 * @param {Array}                      buffer - The array of collected documents that will be returned to the client
 * @param {stepstore-step-insert~data} step   - Step data
 * @return {Array} - Modified buffer
 */
module.exports.execute = function executeInsert(store, buffer, step) {
  const collections = store.collections;
  utils.validateCollectionName(step.collection);
  if (!isArray(step.documents)) {
    throw new Error(`Invalid documents array: "${step.documents}"`);
  }
  const collection = utils.ensureCollection(collections, step.collection);
  step.documents.forEach((doc) => {
    if (!isObject(doc)) {
      throw new Error(`Invalid document: "${doc}"`);
    }
    utils.addToCollection(collection, doc, step.collection);
    step.addToBuffer !== false && buffer.push(doc);
    debug('inserted doc: %j to collection %s', doc, step.collection);
  });
  return buffer;
};

module.exports.type = 'INSERT';
