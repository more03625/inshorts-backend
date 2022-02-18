/* Modules */
const express = require('express')
const app = express();
const http = require('http');
const mongoose = require('mongoose');
const debug = require('debug')('nodeapi:server');
const bodyParser = require('body-parser');
const fs = require('fs')
const path = require('path');
const cookieParser = require('cookie-parser')
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const cronJob = require('cron').CronJob;
require('dotenv').config();
const fileupload = require("express-fileupload");
const cors = require("cors");
app.use(cors());
require('./db/connection.js')
/* helper */
const helper = require('./lib/helper');

/* Routes */
var news = require('./routes/news');
var category = require('./routes/category');
var author = require('./routes/author');


/* connect mongodb */
//mongoose.connect('mongodb://localhost/astroapi', { useNewUrlParser: true });

// mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.rlosg.mongodb.net/${process.env.DB_DATABASE}?retryWrites=true&w=majority`, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });

mongoose.debug = true
mongoose.set('debug', true);

app.use(bodyParser.json({ limit: "500mb" }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true, parameterLimit: 50000 }))
app.use(express.json());
app.use(fileupload());


/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '5254');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

/* test */
app.get('/', function (req, res) {
    res.send('Hello News Db!');
});

app.use(function (req, res, next) {
    const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:5256",
        "http://3.140.177.16",
        "http://3.140.177.16:5254",
        "http://192.168.0.104:3000",
        "https://reactjs-newsdb.netlify.app"
    ];
    const origin = req.headers.origin;
    console.log('origin', origin);
    // res.setHeader("Access-Control-Allow-Origin", "*");

    if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
        res.setHeader("Access-Control-Allow-Origin", "https://reactjs-newsdb.netlify.app");
        // res.setHeader("Access-Control-Allow-Origin", "*");
    }

    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin,Content-Type, token, x-id, Content-Length, X-Requested-With, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    next();
});

app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use('/news', news)
app.use('/category', category)
app.use('/author', author)


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
    console.log("running on", bind)
}

module.exports = app;