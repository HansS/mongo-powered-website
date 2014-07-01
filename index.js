var express = require('express');
var http = require('http');
var grunt = require('grunt');
var path = require('path');
var engine = require('ejs-locals');
var passport = require('passport');
var flash = require('connect-flash');
var database = require('./database');
var Authentication = require('./authentication');
var Config = require('./config');
var MongoSessionStore = require('./store.js');
var Resource = require('express-resource');
new Resource();

var app = express();
var auth = new Authentication();

var timestamp = grunt.file.read( __dirname + '/dist/build_timestamp.txt');

passport.use(auth.strategy());
passport.serializeUser(auth.serializeUser.bind(auth));
passport.deserializeUser(auth.deserializeUser.bind(auth));

var authorize = function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.redirect('/');
    return;
  }
  next();
};

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(express.favicon(path.join(__dirname, 'public','images','Bookmark-leftsquare3.ico')));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.session({
  secret: Config.sessionSecret,
  key: Config.cookieName,
  store: new MongoSessionStore(database)
}));
app.use(function(req, res, next) {
  res.locals.timestamp = timestamp;
  next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(app.router);

// restful urls
app.resource('api/user',    require('./rest/user'));
app.resource('api/chapter', require('./rest/chapter'));
app.resource('api/profile', require('./rest/profile'));

//public urls
app.use('/components', express.static(path.join(__dirname, '/bower_components')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));
app.use('/lib', express.static(path.join(__dirname, 'lib')));
// Serve cache busted assets.
app.get("/assets/:timestamp/*",function(req,res){
  res.sendfile('dist/' + req.params[0]);
});

// Make sure we don't send 304 status http://stackoverflow.com/questions/18811286/nodejs-express-cache-and-304-status-code
app.disable('etag');

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app urls
var renderView = function(view, model) {
  return function(req, res) {
    model = model || {};
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Pragma", "no-cache");
    res.header("Expires", 0);
    res.render(view, model);
  };
};

app.get('/', function (req, res) {
  if (req.user) {
    res.redirect('/mynovel');
  } else {
    res.render('index', {error: req.flash('error')});
  }
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/mynovel',
    failureRedirect: '/',
    failureFlash: 'Invalid username or password'
}));

app.get('/mynovel',
  authorize,
  renderView("mynovel"));

app.get("/signup", function(req, res) {
  renderView("signup").call(null, req, res);
});

app.get('/signout', function(req, res) {
  req.logout();
  res.redirect('/');
});

//server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

process.on('SIGINT', function() {
  database.close();
  process.exit();
});
