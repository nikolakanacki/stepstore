const debug = require('debug')('stepstore:step:sort');
const utils = require('../utils');
const isArray = require('lodash/isArray');

/**
 * SORT
 * Sort documents in buffer by defined criterias
 * @module stepstore-step-sort
 */

/**
 * @typedef stepstore-step-sort~criteria
 * @property {string}         property      - Property to sort by (or one of the predefined types such as "GEO")
 * @property {('ASC'|'DESC')} [order='ASC'] - Ordering of items
 * @property {Object}         [center]      - Used when GEO sorting, needs valid latitude and longitude properties
 */

/**
 * @typedef stepstore-step-sort~data
 * @property {Array<stepstore-step-sort~criteria>} sort - Array of criterias to sort by
 */

/**
 * @private
 */
function sortByValue(a, b, property, multiplier = 1) {
  return (a[property] > b[property]
  ? 1 : a[property] < b[property]
  ? -1 : 0) * multiplier;
}

/**
 * Execute insert
 * @param {StepStoreServer}          store  - Store to execute on
 * @param {Array}                    buffer - The array of collected documents that will be returned to the client
 * @param {stepstore-step-sort~data} step   - Step data
 * @param {Date}                     date   - Date to use when accessing documents
 * @return {array} - Modified buffer
 */
module.exports.execute = function executeSort(store, buffer, step) {
  if (!buffer.length) {
    return buffer;
  }
  if (!isArray(step.sort)) {
    throw new Error(
      `Expected an array of sort criteria but got "${step.sort}"`,
    );
  }
  const geoCriterias = step.sort.find(criteria => criteria.property === 'GEO');
  if (geoCriterias.length > 1) {
    throw new Error('Geo sort can only be applied once per sort step');
  } else if (geoCriterias.length) {
    if (!geoCriterias[0].center) {
      throw new Error('Geo sort criteria requires a valid center point');
    }
    buffer.forEach((doc) => {
      doc._dist = utils.getDistance(
        geoCriterias[0].center.latitude, doc.latitude,
        geoCriterias[0].center.longitude, doc.longitude,
      );
    });
  }
  debug('sort criterias count: %s', step.sort.length);
  buffer.sort((a, b) => {
    let compared = 0;
    step.sort.forEach((criteria, i) => {
      compared += sortByValue(
        a,
        b,
        criteria.property === 'GEO' ? '_dist' : criteria.property,
        (criteria.order === 'DESC' ? -1 : 1) * (step.sort.length - i),
      );
    });
    return compared;
  });
  return buffer;
};

module.exports.type = 'SORT';
