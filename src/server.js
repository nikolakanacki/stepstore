const debug = require('debug')('stepstore:client');
const JSONBottle = require('json-bottle');
const StepStoreInterface = require('./interface');
const isUndefined = require('lodash/isUndefined');

/**
 * @typedef StepStoreServer~result
 * @property {array}        buffer - Collected documents from executing the steps
 * @property {(Error|null)} error  - Error that interrupted the walk
 */

/**
 * StepStore Server
 * @class
 */
class StepStoreServer extends StepStoreInterface {

  /**
   * Collections
   * @type {Object}
   */
  get collections() {
    return this._collections;
  }

  /**
   * Constructor
   * @param {external:JSONBottleInterface~config} [config] - Underlying JSONBottleInterface configuration
   */
  constructor(config) {
    super(JSONBottle.Server, config);
    this._collections = {};
    this._steps = {};
  }

  /**
   * Ensure that collection exists
   * @param {string} name - Collection name
   * @return {Object} - The ensured collection
   */
  ensureCollection(name) {
    this._collections[name] = this._collections[name] || {};
    return this._collections[name];
  }

  /**
   * Execute specified steps
   * @param {StepStoreInterface~step} ...steps - Steps to execute
   * @return {StepStoreServer~result} - Walk result
   */
  walk(...steps) {
    const date = new Date();
    const invalidStep = steps.find(step => !step || !this._steps[step.type]);
    if (!isUndefined(invalidStep)) {
      throw new Error(
        `Found an invalid step type: ${invalidStep
        ? invalidStep.type
        : undefined}`
      );
    }
    try {
      return {
        buffer: steps.map((buffer, step) => {
          debug('executing step:', step);
          return this._steps[step.type].execute(this, buffer, step.data, date);
        }, []),
        error: null,
      };
    } catch (error) {
      return {
        buffer: [],
        error,
      };
    }
  }
}

module.exports = StepStoreServer;
