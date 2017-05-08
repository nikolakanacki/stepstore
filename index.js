/**
 * StepStore
 * @module stepstore
 */

/** @property {StepStoreServer} Server - Server class */
module.exports.Server = require('./src/server');

/** @property {StepStoreClient} Client - Client class */
module.exports.Client = require('./src/client');

/** @property {Object} utils - StepStore utilities */
module.exports.utils = require('./src/utils');
