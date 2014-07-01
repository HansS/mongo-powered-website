var Restful = require("./restful"),
    extend  = require("xtend"),
    Q       = require('q'),
    hash    = require('./hash'),
    mcapi = require('mailchimp-api/mailchimp'),
    Config = require('../config'),
    _       = require('lodash');


var resource = new Restful("users");
var mcapi = require('mailchimp-api/mailchimp');
mc = new mcapi.Mailchimp(Config.mailchimp_api_key);


/**
 * checks existance of the user
 * @param  {String} email
 * @param  {Object} validation
 * @return {Promise}
 */
resource.validateUserExistence = function(email, validation) {
  var that = resource;
  return that.database
          .queryOne(that.collectionName, { email: email })
          .then(function(user) {
            if (user) {
              validation.email = "An account already exists with that email";
            }
            return validation;
          });
};

/**
 * validates a user input
 * @param {Objet} body HTTP request body object;
 * @param {Objet} validation validation
 * @return {Promise} Validity object
 */
resource.validateUserInput = function(body, validation) {
  var deferred = Q.defer();
  var validemail = /^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$/;
  var pwdlength = hash.pwdLength;

  body.email = body.email || "";
  if (!body.email.match(validemail)) { validation.email = "Specify valid email"; }
  if (!body.email) { validation.email = "Specify email"; }

  if (!body.firstname) { validation.firstname = "Specify first name"; }
  if (!body.lastname) { validation.lastname = "Specify last name"; }

  body.password = body.password || "";
  if (body.password.length < pwdlength) { validation.password = (pwdlength + " characters minimum"); }
  if (!body.password) { validation.password = "Specify password"; }
  if (body.password !== body.passwordconfirm) { validation.password = "Passwords should match"; }

  delete body.passwordconfirm;

  if (!Object.keys(validation).length) {
    deferred.resolve(body);
  } else {
    deferred.reject(validation);
  }

  return deferred.promise;
};

/**
 * strips secure fields from update body
 * @param  {Object} body updates
 * @return {Promise}
 */
resource.stripFields = function (body) {
  delete body.email;
  delete body.password;
  delete body.passwordconfirm;
  delete body.oldpassword;
  return Q.resolve(body);
};

resource.handle('create', function(id, req, res) {
  var that = resource;
  var body = req.body;
  var validation = {};
  var email = body.email;
  var firstname = body.firstname;
  var lastname = body.lastname;
  that.database.db()
    .then(function() {
      return that.validateUserExistence(email, validation);
    })
    .then(function() {
      return that.validateUserInput(body, validation);
    })
    .then(function(bdy) {
      body = bdy;
      body.password = hash.hashPwd(body.password);
      return that.database.create(that.collectionName, body);
    })
    .then(function() {
        // Subscribe the user to mailchimp async, no need to wait.
        var merge_vars = {
          FNAME: firstname,
          LNAME: lastname,
          "groupings": [
            {
              "id": 9409,
              "groups": ["Member"]
            }
          ]
        };
        mc.lists.subscribe({id: Config.mailchimp_list_id, email:{email:email}, merge_vars: merge_vars, double_optin: false}, function(data) {
          console.log('Mailchimp subscription', data)
        }, function(error) {
          console.log('Mailchimp subscription error', error);
        });

      return Q.nfcall(req.login.bind(req), body);
    })
    .then(that.success(res))
    .catch(function(err) {
      if (err instanceof Error) {
        that.error(res).call(that, err);
      } else {
        validation = err;
        res.send(400, validation);
      }
    });
  return true;
});

resource.handle('update', function(id, req, res) {
  var that = resource;
  var user = req.user;
  var updates = req.body;
  var validation = {};
  if (user && user._id && id === user._id.toString()) {
    that.database.db()
      .then(function () {
        return that.stripFields(updates);
      })
      .then(function (upd) {
        updates = upd;
        return that.database.update(that.collectionName, id, updates);
      })
      .then(that.success(res))
      .catch(function(err) {
        if (err instanceof Error) {
          that.error(res).call(that, err);
        } else {
          validation = err;
          res.send(400, validation);
        }
      });
  } else {
    that.forbidden(res).call(that);
  }
  return true;
});

resource.handle('index', function(id, req, res) {
  var that = resource;
  var user = req.user;
  if (user && user._id) {
    that.database.queryOne(this.collectionName, { _id: user._id })
          .then(function(doc) {
            if (!doc) throw new Error(404);
            res.send(doc);
          })
          .catch(that.notFound(res));
  } else {
    res.send(404);
  }
  return true;
});

module.exports = resource.routes();