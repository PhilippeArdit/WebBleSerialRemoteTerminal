// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// NodeJS with Express framework
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const express = require('express');
const rfs = require('rotating-file-stream');
const morgan = require('morgan');
const path = require('path');
const winston = require('winston');
const app = express();

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Define HTTP server and port
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// Change this following line to allow self hosted HTTPS (after creating server.key and server.cer files)
const httpModule = 'http';
// const httpModule = 'https';

var server;
const httpServer = require(httpModule);
if (httpModule == 'https') {

  const fs = require('fs');
  const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cer')
  };
  server = httpServer.createServer(options, app);
} else
  server = httpServer.createServer(app);

const port = process.env.PORT || 3000;

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Socket on top of http server
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const {
  Server
} = require("socket.io");
const io = new Server(server);

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Log to console and file
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=


// ----------------
// Application logs
// ----------------

// Cf. https://github.com/winstonjs/winston
const format = winston.format;

const logger = winston.createLogger({
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    chat: 3,
    command: 4,
    result: 5
  },
  format: format.combine( // combining multiple format options
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS' // for adding timestamp to log
    }),
    format.prettyPrint(), // for pretty printing log output
  ),
  transports: [
    new winston.transports.Console({
      level: 'result'
    }),
    new winston.transports.File({
      filename: path.join(__dirname, 'logs', 'app.log'),
      level: 'result'
    })
  ]
});

// ----------------
// HTTP access logs
// ----------------

// create a rotating write stream
var accessLogStream = rfs.createStream('access.log', {
  interval: '1d', // rotate daily
  path: path.join(__dirname, 'logs')
})

// setup the logger (Cf. https://expressjs.com/en/resources/middleware/morgan.html)
// Standard Apache short log output.
// :remote-addr :remote-user :method :url HTTP/:http-version :status :res[content-length] - :response-time ms
app.use(morgan('combined', {
  stream: accessLogStream
}))

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Main HTML page
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Socket events
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// socket.emit : sends to current client only
// socket.broadcast.emit : sends to all client but the current one
// io.sockets.emit : sends to all client

io.on('connection', (socket) => {
  var userId = socket.handshake.query.t /* + socket.handshake.issued */;

  // Send some informations to new client
  socket.emit('connectInfo', {
    userId: userId
  });

  const ioSocketEmit = (eventName, msg, sep) => {
    const jsonObj = {
      userId: userId,
      msg: msg,
      eventName: eventName,
      sep: sep
    }

    // connectInfo, myNameIs, disconnect, termDataIn, logTermDataIn, chatMsg, termMsgOut, isTermConnected, termToggleConnected, whoIsConnected
    switch (eventName) {
      case 'termDataIn': // no longer log 'termDataIn' because those events come in bad order !
      case 'isTermConnected':
      case 'whoIsConnected':
      case 'termToggleConnected':
        break;
      case 'logTermDataIn':
        logger.result({
          userId: userId,
          msg: msg
        });
        break;
      case 'termMsgOut':
        logger.command({
          userId: userId,
          msg: msg
        });
        break;
      case 'chatMsg':
        logger.chat(jsonObj.userId + jsonObj.sep + jsonObj.msg);
        break;
      default:
        logger.info(jsonObj);
        break;
    };

    io.sockets.emit(eventName, jsonObj);
  }

  ioSocketEmit('chatMsg', 'connected', ' is ');

  socket.onAny((eventName, ...args) => {
    var msg = args[0];
    var sep = '> ';
    var evtName = eventName;

    switch (eventName) {
      case 'myNameIs':
        evtName = 'chatMsg';
        sep = ' is renamed as ';
        break;
      case 'disconnect':
        evtName = 'chatMsg';
        sep = ' is ';
        msg = 'disconnected';
        break;
      case 'termDataIn':
        evtName = 'termDataIn';
        sep = '';
        break;
      default:
        break;
    };

    // Boradcast
    ioSocketEmit(evtName, msg, sep);

    // Do something after
    switch (eventName) {
      case 'myNameIs':
        userId = msg;
        break;
      default:
        break;
    };
  });
});


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Launch HTTP Server
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
server.listen(port, () => {
  logger.info(`Server running at ${httpModule}://localhost:${port}/`);
});