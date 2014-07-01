var database = require('../database'),
    en = require('lingo').en,
    ObjectId = require('mongodb').ObjectID,
    Q = require('q');

var notFound  = function(res) { return function() {res.send(404);}; };
var forbidden = function(res) { return function() {res.send(403);}; };
var success   = function(res) { return function() {res.send(200);}; };
var successp  = function(res) { return function(p) {res.send(200, p);}; };
var error     = function(res) { return function(err) {res.send(500, err);}; };

var Restful = function(collectionName, resource) {
  this.collectionName = collectionName;
  this.resource = resource || en.singularize(collectionName);

  this.database  = database;
  this.notFound  = notFound;
  this.error     = error;
  this.forbidden = forbidden;
  this.success   = success;
  this.successp  = successp;

  this.handlers = {};

};

Restful.prototype.handle = function(method, func) {
  var handler = func.bind(this);
  this.handlers[method] = handler;
};

Restful.prototype.checkHandler = function(method, id, req, res) {
  var handler = this.handlers[method];
  if (handler) {
    return handler(id, req, res);
  }
};

// POST
Restful.prototype.create = function(req, res) {
  if (this.checkHandler('create', null, req, res)) return;
  database.create(this.collectionName, req.body)
          .then(success(res))
          .catch(error(res));
};

// GET/
Restful.prototype.index = function(req, res) {
  if (this.checkHandler('index', null, req, res)) return;
  database.query(this.collectionName, {})
          .then(function(array) {
            if (!array) throw new Error(404);
            res.send(array);
          })
          .catch(notFound(res));
};

// GET/1
Restful.prototype.show = function(req, res) {
  var id = req.params[this.resource];
  if (this.checkHandler('show', id, req, res)) return;
  database.queryOne(this.collectionName, {_id: new ObjectId(id)})
          .then(function(doc){
            if (!doc) throw new Error(404);
            res.send(doc);
          })
          .catch(notFound(res));
};

// PUT/1
Restful.prototype.update = function(req, res) {
  var id = req.params[this.resource];
  if (this.checkHandler('update', id, req, res)) return;
  database.update(this.collectionName, id, req.body)
          .then(success(res))
          .catch(notFound(res));
};

// DELETE/1
Restful.prototype.destroy = function(req, res) {
  var id = req.params[this.resource];
  if (this.checkHandler('destroy', id, req, res)) return;
  database.delete(this.collectionName, id)
          .then(success(res))
          .catch(notFound(res));
};

Restful.prototype.routes = function(opts) {
  var that = this;
  return {
    index: that.index.bind(that),
    create: that.create.bind(that),
    show: that.show.bind(that),
    update: that.update.bind(that),
    destroy: that.destroy.bind(that)
  };
};

module.exports = Restful;

/*GET     /                 ->  index
  GET     /new              ->  new
  POST    /                 ->  create
  GET     /:id              ->  show
  GET     /:id/edit         ->  edit
  PUT     /:id              ->  update
  DELETE  /:id              ->  destroy*/
