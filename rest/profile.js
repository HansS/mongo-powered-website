var Restful = require("./restful"),
    hash    = require('./hash'),
    Q       = require('q');

var resource = new Restful("users", "profile");

/**
 * validates old password with current
 * @param  {Object} updates
 * @param  {String} oldPassword
 * @return {Promise} resolves to Updates, rejects to Validation
 */
resource.validateAndUpdatePassword = function (body, oldPassword) {
  var deferred = Q.defer();
  var validation = {};
  var pwdlength = hash.pwdLength;

  if (!body.oldpassword) {validation.oldpassword = 'Old password missing.';}
  if (!body.password) {validation.password = 'Password missing.';}
  if (!body.passwordconfirm) {validation.passwordconfirm = 'Password confirm missing.';}
  if (body.password.length < pwdlength) { validation.password = (pwdlength + ' characters minimum'); }
  if (body.password !== body.passwordconfirm) {validation.password = 'Passwords should match.';}

  if (!hash.comparePwd(body.oldpassword, oldPassword)) {validation.oldpassword = 'Old password is wrong.';}

  if (!Object.keys(validation).length) {
    deferred.resolve({
      password: hash.hashPwd(body.password)
    });
  } else {
    deferred.reject(validation);
  }

  return deferred.promise;
};

resource.handle('update', function(id, req, res) {
  var that = resource;
  var user = req.user;
  var updates = req.body;
  var validation = {};
  if (user && user._id && id === user._id.toString()) {
    that.database.db()
      .then(function() {
        return that.database.getById(that.collectionName, id);
      })
      .then(function(doc) {
        return that.validateAndUpdatePassword(updates, doc.password);
      })
      .then(function(upd) {
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

module.exports = resource.routes();