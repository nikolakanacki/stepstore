// const debug = require('debug')('stepstore:client');
const JSONBottle = require('json-bottle');
const StepStoreInterface = require('./interface');
const isObject = require('lodash/isObject');
const defaultSteps = require('./steps');

/**
 * StepStore Client
 * @class
 */
class StepStoreClient extends StepStoreInterface {

  /**
   * Constructor
   * @param {external:JSONBottleInterface~config} [config] - Underlying JSONBottleInterface configuration
   */
  constructor(config) {
    super(JSONBottle.Client, config);
    this._collections = {};
    this._steps = defaultSteps;
  }

  /**
   * Walk
   */
  walk(...steps) {
    const validationError = steps.find((step) => {
      if (!isObject(step)) {
        return new Error(`Expected a step object but got: "${step}"`);
      } else if (!this._steps[step.type]) {
        return new Error(`Invalid or undefined step type: "${step.type}"`);
      }
      try {
        this._steps[step.type].validate &&
        this._steps[step.type].validate(step);
      } catch (error) {
        return error;
      }
      return false;
    });
    if (validationError) {
      return Promise.reject(validationError);
    }
    return this.iface
    .request(StepStoreInterface.PATH, { steps })
    .then((res) => {
      if (res.error) {
        throw res.error;
      }
      return res.buffer || [];
    });
  }
}

module.exports = StepStoreClient;
