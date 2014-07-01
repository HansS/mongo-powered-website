var LocalStrategy = require('passport-local').Strategy,
    ObjectId = require('mongodb').ObjectID,
    database = require('./database'),
    bcrypt   = require('bcryptjs');

var Authentication = function() {
};

Authentication.prototype.strategy = function() {
  return new LocalStrategy({usernameField: 'email'}, function(email, pass, done) {
    database.queryOne("users", { email: email })
      .then(function(user) {
        if (user) {
          var valid = bcrypt.compareSync(pass, user.password);
          done(null, valid ? user : false);
        } else {
          // user not found
          done(null, false);
        }
      })
      .catch(done);
  });
};

Authentication.prototype.serializeUser = function(user, done) {
  done(null, user._id);
};

Authentication.prototype.deserializeUser = function(id, done) {
  database.getById("users", id)
    .then(function(user) {
      done(null, user);
    });
};

module.exports = Authentication;