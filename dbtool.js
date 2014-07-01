var mongojs = require('mongojs');
var lodash = require('lodash');
var Config = require('./config');
var db = mongojs(Config.dbString, ['users']);
var random = require('node-random');
var parseArgs = require('minimist');
var readline = require('readline');
var bcrypt = require('bcryptjs');

var rlOptions = {
  input: process.stdin,
  output: process.stdout
};

var randomOptions = {
  number : 100,
  length: 16,
  digits: true,
  upper: true,
  lower: true,
  unique: true,
  random: "new"
};

var resetPassword = function(email) {
  if (email) {
    var rl = readline.createInterface(rlOptions);
    rl.question('enter new password: ', function (pwd) {
      var hash = bcrypt.hashSync(pwd, 10);
      db.users.update({email:email}, {$set:{password:hash}}, {multi:false, upsert:false}, function(e, doc) {
        if (doc.updatedExisting) {
          console.log('password updated for', email);
        } else {
          console.error('user', email, 'not found.');
        }
        rl.close();
        db.close();
      });
    });
  } else {
    console.error('email is required.');
  }
};

// usage:
// env NODE_ENV=production node dbtool.js --reset-password user@server.com

var argv = parseArgs(process.argv.slice(2));

// reset password:
var passwordResetEmail = argv['reset-password'];
if (passwordResetEmail) {
  resetPassword(passwordResetEmail);
}
