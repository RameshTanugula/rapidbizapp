var express = require('express');
var session = require('express-session');
var cors = require('cors');
var path = require('path');
var bodyParser = require('body-parser');
var fs = require('fs');
var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('env', 'development');

var jsonParser = bodyParser.json({ limit: '150mb' });
var urlencodedParser = bodyParser.urlencoded({
    extended: false, limit: '150mb', parameterLimit: 50000
});
app.use(jsonParser);
app.use(urlencodedParser);
app.use(cors());

app.use(session({
    secret: 'my_secret_key',
    resave: true,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'config')));

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Start of Code for Handling Uncaught Exceptions
process.on('uncaughtException', function (err) {
    console.error('Un Caught Exception: ', err);
});
// --- End of Code for Handling Uncaught Exceptions
// ---Start of code for Swagger ---//
var subpath = express();
var swagger = require('swagger-node-express').createNew(subpath);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static('dist'));

swagger.configureSwaggerPaths('', 'api-docs', '');
var domain = 'localhost';
var applicationUrl = 'http://' + domain;
swagger.configure(applicationUrl, '1.0.0');
// ---End of code for Swagger ---//
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type, token');

    // Response headers you wish to Expose
    res.setHeader('Access-Control-Expose-Headers', 'X-Requested-With, content-type, token');

    // Set to true if you need the website to include cookies in the requests sent

    res.setHeader('Access-Control-Allow-Credentials', true);
    next();

});

app.disable('etag');

// dynamically include routes (Controller)
fs.readdirSync('./controllers').forEach(function (file) {
    if (file.substr(-3) == '.js') {
        require('./controllers/' + file).controller(app);
    }
});

var debug = require('debug')('ncapp:server');
var http = require('http');
var port = normalizePort('3001');
app.set('port', port);
var server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port))
        return val;

    if (port >= 0)
        return port;

    return false;
}

function onError(error) {
    if (error.syscall !== 'listen')
        throw error;

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.log(bind + ' is already in use');
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}

module.exports = app;