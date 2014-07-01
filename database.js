var Mongodb = require('mongodb'),
    ObjectId = require('mongodb').ObjectID,
    Q = require('q'),
    Config = require('./config');

var Database = function() {
};

Database.prototype.db = function() {
  var that = this;
  if (!!this._db) { return this._db; }
  this._db = Q.nfcall(Mongodb.connect.bind(Mongodb), Config.dbString)
    .then(function (db) {
      db.on('close', function () {
        that._db = null;
      });
      return db;
    })
    .catch(function (e) {
      that._db = null;
      return Q.reject(new Error("Failed to connect to mongodb"));
    });
  return this._db;
};

Database.prototype.close = function() {
  this.db().then(function(db){
    db.close();
  });
};

Database.prototype.queryOne = function(collectionName, query, projection) {
  projection = projection || {};
  return this.db()
      .then(function(db) {
        var collection = db.collection(collectionName);
        return Q.nfcall(collection.findOne.bind(collection), query, projection);
      });
};

Database.prototype.query = function(collectionName, query, projection) {
  projection = projection || {};
  return this.db()
      .then(function(db) {
        var collection = db.collection(collectionName);
        return Q.nfcall(collection.find.bind(collection), query, projection);
      })
      .then(function(cursor){
        return Q.nfcall(cursor.toArray.bind(cursor));
      });
};

Database.prototype.delete = function(collectionName, id) {
  return this.db()
      .then(function(db) {
        var collection = db.collection(collectionName);
        return Q.nfcall(collection.remove.bind(collection), {_id: new ObjectId(id)});
      });
};

Database.prototype.deleteMany = function(collectionName, query) {
  return this.db()
      .then(function(db) {
        var collection = db.collection(collectionName);
        return Q.nfcall(collection.remove.bind(collection), query);
      });
};

Database.prototype.update = function(collectionName, id, updates) {
  return this.db()
      .then(function(db) {
        var collection = db.collection(collectionName);
        return Q.nfcall(collection.update.bind(collection), {_id: new ObjectId(id)}, {$set:updates});
      });
};

Database.prototype.upsert = function(collectionName, query, updates) {
  return this.db()
    .then(function(db) {
      var collection = db.collection(collectionName);
      return Q.nfcall(collection.update.bind(collection), query, updates, {upsert: true});
    });
};

Database.prototype.updateMany = function(collectionName, query, updates) {
  return this.db()
      .then(function(db) {
        var collection = db.collection(collectionName);
        return Q.nfcall(collection.update.bind(collection), query, updates, {multi: true});
      });
};

Database.prototype.create = function(collectionName, obj) {
  obj.created = +new Date();
  return this.db()
      .then(function(db) {
        var collection = db.collection(collectionName);
        return Q.nfcall(collection.insert.bind(collection), obj);
      });
};

Database.prototype.count = function(collectionName, obj) {
  return this.db()
      .then(function(db) {
        var collection = db.collection(collectionName);
        return Q.nfcall(collection.count.bind(collection), obj);
      });
};

Database.prototype.getById = function(collectionName, id) {
  if (!(id instanceof ObjectId)) {
    id = new ObjectId(id.toString());
  }
  var query = { _id: id };
  return this.queryOne(collectionName, query);
};

module.exports = new Database();