var express = require('express');

var session = express.session;
var COLLECTION = "sessions";

var MongoSessionStore = function(database) {
  this.database = database;
};

MongoSessionStore.prototype = Object.create(session.Store.prototype);

/**
 * commits session to store
 * @param {[type]}   sid      [description]
 * @param {[type]}   session  [description]
 * @param {Function} callback [description]
 */
MongoSessionStore.prototype.set = function(sid, session, callback) {
  session.sid = sid;
  this.database.upsert(COLLECTION, {sid: sid}, session)
      .then(callback.bind(null, null))
      .catch(callback);
};

/**
 * gets the session from store
 * @param  {[type]}   sid      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
MongoSessionStore.prototype.get = function(sid, callback) {
  this.database.queryOne(COLLECTION, {sid: sid}, { _id: 0 })
      .then(function(sess) {
        callback(null, sess);
      })
      .catch(callback);
};

/**
 * destrys session from store
 * @param  {[type]}   sid      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
MongoSessionStore.prototype.destroy = function(sid, callback) {
  this.database.deleteMany(COLLECTION, {sid: sid})
      .then(callback.bind(null, null))
      .catch(callback);
};

module.exports = MongoSessionStore;