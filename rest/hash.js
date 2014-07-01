var bcrypt  = require('bcryptjs');

/**
 * hashes the password
 * @param  {String} pwd plain text password
 * @return {String} hashed password
 */
var hashPwd = function (pwd) {
  return bcrypt.hashSync(pwd, 10);
};

/**
 * comapres hashed & attempted pwds
 * @param  {String} hash
 * @param  {String} attempt
 * @return {Boolean}
 */
var comparePwd = function (attempt, hash) {
  return bcrypt.compareSync(attempt, hash);
};

module.exports = {
  hashPwd: hashPwd,
  comparePwd: comparePwd,
  pwdLength: 6 // minimum password length
};