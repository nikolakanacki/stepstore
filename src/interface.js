// const debug = require('debug')('stepstore:client');
const EventEmitter = require('event-emitter-es6');
const uuid = require('uuid');
const isObject = require('lodash/isObject');
const isString = require('lodash/isString');
const isFunction = require('lodash/isFunction');

/**
 * @external JSONBottleInterface~config
 * @see {@link https://nikolakanacki.github.io/json-bottle/JSONBottleInterface.html#~config}
 */

/**
 * @callback StepStoreInterface~stepCallback
 * @param {Object} store  - Store that is executing this step
 * @param {Array}  buffer - The array of collected documents that will be returned to the client
 * @param {Object} step   - Data passed with the step that invoked the execution
 * @param {Date}   date   - Date used for accessing the document (date of the walk)
 * @return {Array} - Modified buffer
 */

/**
 * @typedef StepStoreInterface~step
 * @property {string} type - Step type (step name)
 * @property {Object} data - Data passed to the step callback
 */

/**
 * @typedef StepStoreInterface~StepType
 * @property {string}                          type    - Step type (step name)
 * @property {StepStoreInterface~stepCallback} execute - Step execution
 */

/**
 * StepStore Interface
 * @class
 */
class StepStoreInterface extends EventEmitter {

  /**
   * Generate id
   * @return {string} - Freshly generated UUIDv4
   */
  static uuid() {
    return uuid.v4();
  }

  /**
   * Undelying communication interface
   * @type {external:JSONBottleInterface}
   */
  get iface() {
    return this._iface;
  }

  /**
   * The Constructor
   * @param {external:JSONBottleInterface}        IfaceClass - Class that extends JSONBottleInterface whish is used to create the underlying communication interface
   * @param {external:JSONBottleInterface~config} [config]   - Underlying JSONBottleInterface configuration
   */
  constructor(IfaceClass, config) {
    super({
      emitDelay: 0,
      strictMode: false,
    });
    this._iface = new IfaceClass(config);
    this._iface.on('connect', ev => this.emit('connect', ev));
    this._iface.on('disconnect', ev => this.emit('disconnect', ev));
    this._iface.on('started', ev => this.emit('started', ev));
    this._iface.on('stopped', ev => this.emit('stopped', ev));
    this._steps = {};
  }

  /**
   * Register new step type
   * @param {StepStoreInterface~StepType} step - Step to register
   * @return {StepStoreInterface} - Self
   */
  addStepType(step) {
    if (!isObject(step)) {
      throw new Error(`Expected a step object but got "${step}"`);
    } else if (!isString(step.type)) {
      throw new Error(`Expected a step type but got "${step.type}"`);
    } else if (!isFunction(step.execute)) {
      throw new Error(`Expected a step executor but got "${step.execute}"`);
    } else if (this._steps[step.type]) {
      throw new Error(`Step type "${step.type}" already exists`);
    } else {
      this._steps[step.type] = step;
    }
  }

  /**
   * Remove step type
   * @param {string} type - Type of the step to remove
   * @return {StepStoreInterface} - Self
   */
  removeStepType(type) {
    delete this._steps[type];
    return this;
  }

  /**
   * Start the interface
   * @param {number} port - Port to listen to
   * @param {string} host - Host to bind to
   * @return {StepStoreInterface}
   */
  start(port, host) {
    this._iface.start(port, host);
    return this;
  }

  /**
   * Stop the interface
   * @param {function} [cb] - Callback invoked once the interface has fully stopped
   * @return {StepStoreInterface}
   */
  stop(cb) {
    this.iface.stop(cb);
    return this;
  }
}

module.exports = StepStoreInterface;
module.exports.PATH = '@STEPSTORE';
