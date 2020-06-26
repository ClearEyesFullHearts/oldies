
/**
    * Module dependencies.
    */

var express        = require('express')
    , morgan         = require('morgan')
    , bodyParser     = require('body-parser')
    , methodOverride = require('method-override')
    , api            = require('./routes/rest')
    , passport       = require('passport')
    , compression    = require('compression')
    , BasicStrategy  = require('passport-http').BasicStrategy
    , auth           = require('./security/auth')
    , config         = require('./config/config');


exports.start = function(errorHandler, defaultPort){

    var app = express();
    var port = process.env.PORT || defaultPort;
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');

    // ERROR HANDLING
    if(errorHandler){
        app.use(errorHandler);
    };

    app.use(morgan('dev')); 					// log every request to the console
    app.use(bodyParser.json());                 // pull information from html in POST
    app.use(bodyParser.urlencoded({
      extended: true
    })); 						                // pull information from html in POST
    app.use(methodOverride());                  // simulate DELETE and PUT
    app.use(passport.initialize());

    // compress all requests
    app.use(compression());

    //AUTHENTICATION
    passport.use('anon', new BasicStrategy( auth.anonymous ));
    passport.use('user', new BasicStrategy( auth.identified ));
    passport.use('admin', new BasicStrategy( auth.admin ));

    var anon = function(req, res, next){
        passport.authenticate('anon', function(err, user, info) {
            if(user === false){
                res.status(461).end();// User no longer identified
            }else{
                req.user = user;
                next(err, user);
            }
        })(req, res, next);
    };
    var user = function(req, res, next){
        passport.authenticate('user', function(err, user, info) {
            if(user === null){
                res.status(460).end();// User need identification
            }else if(user === false){
                res.status(461).end();// User no longer identified
            }else{
                req.user = user;
                next(err, user);
            }
        })(req, res, next);
    };
    var admin = function(req, res, next){
        passport.authenticate('admin', function(err, user, info) {
            if(!user){
                res.status(462).end();// Admin
            }else{
                req.user = user;
                next(err, user);
            }
        })(req, res, next);
    };

    // ROUTES

    app.get('/api/categories', anon, api.categories);
    app.get('/api/category/:name', anon, api.category);
    app.get('/api/poids', anon, api.weights);
    app.get('/api/pays', anon, api.countries);
    app.get('/api/port/:country', anon, api.port);
    app.get('/api/articles/:category', anon, api.articlesByCategory);
    app.get('/api/articles/:category/:ref', anon, api.articleByRef);
    app.put('/api/users/confirm/:id', anon, api.confirmUser);
    app.post('/api/users', anon, api.createLog);
    app.post('/api/user/log', anon, api.resetLog);
    app.post('/api/loggingIn', anon, api.loggingIn);
    app.post('/api/contact', anon, api.mailContact);
    app.post('/api/identity', anon, api.isLoggedIn);

    app.get('/api/users/:id', user, api.findUser);
    app.get('/api/order/:numComm', user, api.getOrder);
    app.get('/api/orders', user, api.getOrders);
    app.put('/api/users/:id', user, api.updateUser);
    app.put('/api/user/log', user, api.modifyLog);
    app.post('/api/loggingOut', user, api.loggingOut);
    app.post('/api/order', user, api.newOrder);

    app.get('/api/articles', admin, api.articles);
    app.get('/api/users', admin, api.findAllUsers);
    app.get('/api/adminorders', admin, api.getAdminOrders);
    app.get('/api/adminorder/:client_id', admin, api.getAdminClientOrders);
    app.put('/api/articles/:category/:ref', admin, api.modifyArticle);
    app.put('/api/articles/:category/:id/available', admin, api.disponible);
    app.put('/api/articles/:category/:id/unavailable', admin, api.notDisponible);
    app.put('/api/order/:id/inPreparation', admin, api.preparationStatus);
    app.put('/api/order/:id/inDelivery', admin, api.deliveryStatus);
    app.put('/api/order/:id/closed', admin, api.closedStatus);
    app.put('/api/order/:id/canceled', admin, api.canceledStatus);
    app.post('/api/articles/:category', admin, api.createArticle);
    app.post('/api/articles/:category/:ref/color', admin, api.createColorImage);
    app.post('/api/articles/:category/:ref/size', admin, api.createSizePrice);
    app.delete('/api/articles/:category/:ref', admin, api.removeArticle);
    app.delete('/api/articles/:category/:ref/color/:color/:img', admin, api.removeColorImage);
    app.delete('/api/articles/:category/:ref/size/:size/:price', admin, api.removeSizePrice);
    app.delete('/api/users/:id', admin, api.deleteUser);

    //Merc@net Response
    app.post('/api/payResponse', api.payResponseAuto);
    app.post('/caddie/canceled', api.payCanceled);
    app.post('/caddie/confirmed', api.payResponse);

    app.use(express.static(__dirname + config.site.staticdirectory, {maxAge: config.site.maxcacheage }));    // set the static files location /public1/img will be /img for users

    var serv = app.listen(port);
    console.log("Express server listening on port " + port);
};

