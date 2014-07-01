## How to use `dbtool.js`

### Reset password

`$ node dbtool.js --reset-password some@email.com`

you'll be asked for new password,
if user exists - password will be updated


### Running against live environment
#### ![excl](https://cdn2.iconfinder.com/data/icons/fatcow/32x32/caution_biohazard.png) DANGER!!

In order to run any of the above commands against live environment:
 * think twice
 * prepend command with `$ env NODE_ENV=production`, eg
  `$ env NODE_ENV=production node dbtool.js --reset-password some@email.com`
