const debug = require('debug')('stepstore:step:query');
const utils = require('../utils');
const isObject = require('lodash/isObject');
const isArray = require('lodash/isArray');

/**
 * QUERY
 * Find documents selecting and executing a query search
 * @module stepstore-step-query
 */

/**
 * @typedef stepstore-step-query~data
 * @property {string}  collection           - Collection to query
 * @property {Object}  query                - Query object to construct the query from, see extended peoperty for more info on matching
 * @property {array}   [select]             - If present and an array, will first select documents with primary keys (_id) matching those passed in this array. Can also be used on its own if query is not passed
 * @property {boolean} extended             - If true, will treat the query as a sift type query
 * @property {boolean} treatNullAsUndefined - If this is not an extended query (plain key/value matching) will treat null value as undefined (key on document does not exist)
 */

/**
 * Execute insert
 * @param {StepStoreServer}           store  - Store to execute on
 * @param {Array}                     buffer - The array of collected documents that will be returned to the client
 * @param {stepstore-step-query~data} step   - Step data
 * @param {Date}                      date   - Date to use when accessing documents
 * @return {array} - Modified buffer
 */
module.exports.execute = function executeQuery(store, buffer, step, date) {
  const collection = utils.ensureCollection(store.collections, step.collection);
  const selection = !isArray(step.select)
  ? Object.values(collection)
  : step.select.reduce((agr, id) => {
    collection[id] && agr.push(collection[id]);
    return agr;
  }, []);
  if (!selection.length || !isObject(step.query)) {
    debug(
      'returning documents without performing a query match',
      selection.length,
    );
    return selection.filter(
      doc => !!utils.accessDocument(collection, doc._id, date.getTime()),
    );
  }
  debug('querying from a selection of %s document', selection.length);
  const query = step.extended
  ? utils.createExtendedQuery(collection, step.query, date.getTime())
  : utils.createSimpleQuery(
    collection,
    step.query,
    date.getTime(),
    !!step.treatNullAsUndefined,
  );
  return selection.reduce((agr, doc) => {
    query(doc) && utils.addToBuffer(agr, doc);
    return buffer;
  }, buffer);
};

module.exports.type = 'QUERY';
