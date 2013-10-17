var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , TopcoderStrategy = require('passport-topcoder').Strategy;

var MY_CLIENT_ID = "TOPCODER-CLIENT-ID";
var MY_CLIENT_SECRET = "TOPCODE-CLIENT-SECRET";
var MY_CALLBACK_URL = "http://127.0.0.1:3000/auth/topcoder/callback";


// Use the TopcoderStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Topcoder profile), and
//   invoke a callback with a user object.

passport.use(new TopcoderStrategy({
            clientID: MY_CLIENT_ID,
            clientSecret: MY_CLIENT_SECRET,
            callbackURL: MY_CALLBACK_URL
        },
        function(accessToken, refreshToken, params, profile, done) {
           var tokenDTO = {
              accessToken: accessToken,
              expirationTime : params.expires_in,
              scope : params.scope.split(" ")
          };
          return done(null, tokenDTO);
        }
      ));




var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res){
  res.redirect('/login');
});


app.get('/login', function(req, res){
  res.render('login');
});

// GET /auth/topcoder
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Topcoder authentication will involve redirecting
//   the user to topcoder.com.  After authorization, the Topcoder will redirect
//   the user back to this application at /auth/topcoder/callback
app.get('/auth/topcoder',
    passport.authenticate('Topcoder', {scope: ["FORUMS_REST", "CONTEST_REST"]})
  );

// GET /auth/topcoder/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/topcoder/callback', function (req, res, next) {
    passport.authenticate('Topcoder', function (err, token) {
        if (req.query.error) {
            res.render("login", {error: req.query.error});
        } else {
			//you can set the token inside the session if you want to store it
			//remember to add session handling on express
			//req.session.tokens = token;
          res.render("account", {token: token});
        }
    })(req, res, next);
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

app.listen(3000);

