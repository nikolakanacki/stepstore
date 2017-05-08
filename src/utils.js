const exp = module.exports = {};
const uuid = require('uuid');
const sift = require('sift');
const isString = require('lodash/isString');
const isUndefined = require('lodash/isString');

/**
 * Generate fresh uuid v4
 * @return {string} - Generated UUIDv4
 */
exp.generateId = function generateId() {
  return uuid.v4();
};

/**
 * Generate UUIDv4 available for collection
 * @param {Object} collection - Collection to ensure the id is available for
 * @return {string} - Generated UUIDv4
 */
exp.generateIdForCollection = function generateIdForCollection(collection) {
  let id;
  do { id = exp.generateId(); } while (collection[id]);
  return id;
};

/**
 * Validate collection name
 * @param {mixed} name - Name to validate
 * @throws {Error} - Error if passed name is invalid
 */
exp.validateCollectionName = function validateCollectionName(name) {
  if (!isString(name)) {
    throw new Error(`Expected a collection name but got: ${name}`);
  }
};

/**
 * Ensure collection exists
 * @param {Object} collections - Collections object
 * @param {string} name        - Name of the collection to ensure
 * @return {Object} - Ensured collection
 */
exp.ensureCollection = function ensureCollection(collections, name) {
  exp.validateCollectionName(name);
  collections[name] = collections[name] || {};
  return collections[name];
};

/**
 * Add document to the buffer
 * @param {array}  buffer - Buffer array to add the document to
 * @param {Object} doc    - Document to add
 * @return {array} - Modified buffer
 */
exp.addToBuffer = function addToBuffer(buffer, doc) {
  if (!buffer.includes(doc)) {
    buffer.push(doc);
  }
  return buffer;
};

/**
 * Add to collection
 * @param {Object} collection - Collection to insert the document to
 * @param {Object} doc        - Document to insert
 * @throws {Error} - Error if duplicate _id is found
 * @return {Object} - Inserted document
 */
exp.addToCollection = function addToCollection(
  collection,
  doc,
  collectionName,
) {
  if (!isUndefined(doc._id)) {
    if (collection[doc._id]) {
      throw new Error([
        'Duplicate _id attempt: "',
        doc._id,
        '" in collection "',
        collectionName,
        '"',
      ].join(''));
    }
  } else {
    doc._id = exp.generateIdForCollection(collection);
  }
  doc._col = collectionName;
  collection[doc._id] = doc;
  return doc;
};

/**
 * Access document
 * Takes into account _ttl field of the document and acts accordingly
 * @param {Object} collection - Collection to access document from
 * @param {mixed}  id         - Id of the document to access
 * @param {number} now        - Milliseconds to use when comparing _ttl
 * @return {Object|undefined} - Document if not expired, undefined otherwise
 */
exp.accessDocument = function accessDocument(collection, id, now) {
  const doc = collection[id];
  if (!doc) {
    return undefined;
  }
  if (!doc._ttl) {
    return doc;
  }
  const ttlKeys = Object.keys(doc._ttl);
  let ttlKeysCount = ttlKeys.length;
  if (!ttlKeysCount) {
    delete doc._ttl;
    return doc;
  }
  if (doc._ttl._ && doc._ttl._ <= now) {
    delete collection[id];
    return undefined;
  }
  ttlKeys.forEach((key) => {
    if (key !== '_' && doc._ttl[key] <= now) {
      delete doc._ttl[key];
      ttlKeysCount--;
    }
  });
  if (!ttlKeysCount) {
    delete doc._ttl;
  }
  return doc;
};

/**
 * Update document
 * @param {array}  documents  - Array of documents to update
 * @param {Object} data       - Data to update the document with
 * @param {Date}   date       - Date to use for TTL calculations
 * @return {Object} - Updated document
 */
exp.updateDocument = function updateDocuments(documents, data, date) {
  const ttl = data._ttl;
  const time = date.getTime();
  delete data._ttl;
  documents.forEach((doc) => {
    Object.assign(doc, data);
    if (ttl) {
      doc._ttl = Object.assign(doc._ttl || {}, ttl);
      const ttlKeys = Object.keys(doc._ttl);
      if (!ttlKeys.length) {
        delete doc._ttl;
      } else {
        ttlKeys.forEach((key) => {
          doc._ttl[key] = time + ttl;
        });
      }
    }
  });
};

/**
 * Create simple query matcher
 * @param {Object}  collection           - Collection to perform the query on
 * @param {Object}  query                - Query object
 * @param {number}  now                  - Timestamp to use when accessing the document
 * @param {boolean} treatNullAsUndefined - If null is encauntered it is treated as undefined
 * @return {function} - Matcher function
 */
exp.createSimpleQuery = function createSimpleQuery(
  collection,
  query,
  now,
  treatNullAsUndefined,
) {
  return (docCandidate) => {
    const doc = exp.accessDocument(collection, docCandidate._id, now);
    return doc
    ? isUndefined(
      Object.keys(query).find((key) => {
        const match = query[key] === doc[key]
        ? false
        : (treatNullAsUndefined && query[key] === null && isUndefined(doc[key]))
        ? false
        : true;
        return match;
      }),
    ) : false;
  };
};

/**
 * Create extended (sift) query matcher
 * @param {Object} collection - Collection to perform the query on
 * @param {Object} query      - Query object
 * @param {number} now        - Timestamp to use when accessing the document
 * @return {function} - Matcher function
 */
exp.createExtendedQuery = function createSiftQuery(
  collection,
  query,
  now,
) {
  const sifter = sift(query);
  return (docCandidate) => {
    const doc = exp.accessDocument(collection, docCandidate._id, now);
    return doc && sifter(doc);
  };
};

/**
 * Get distance between two points
 * @param {number} lat1 - Point 1 latitude
 * @param {number} lat2 - Point 2 latitude
 * @param {number} lng1 - Point 1 longitude
 * @param {number} lng2 - Point 2 longitude
 * @return {number} - Distance between the two points
 */
exp.getDistance = function getDistance(lat1, lat2, lng1, lng2) {
  const p = 0.017453292519943295;
  const c = Math.cos;
  // eslint-disable-next-line
  const a = 0.5-c((lat2-lat1)*p)/2+c(lat1*p)*c(lat2*p)*(1-c((lng2-lng1)*p))/2;
  return Math.asin(Math.sqrt(a));
};
