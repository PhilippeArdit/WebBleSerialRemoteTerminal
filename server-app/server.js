// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// NodeJS with Express framework
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const express = require('express');
const app = express();

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Define HTTP server and port
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
//const httpModule = 'https';
const httpModule = 'http';
var server;
const httpServer = require(httpModule);
if (httpModule == 'https') {

  const fs = require('fs');
  const options = {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cer')
  };
  server = httpServer.createServer(options, app);
}
else
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
const logToFile = require('log-to-file');
logToConsoleAndFile = msg => {
  console.log(msg);
  logToFile(msg, 'logs/app.log'); // adds "2022.05.26, 11:48:05.0092 UTC -> " before each line
};

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
  var userId = socket.handshake.query.t /* + socket.handshake.issued */ ;

  // Send some informations to new client
  socket.emit('connectInfo', {
    userId: userId
  });

  const ioSocketEmit = (eventName, msg, sep) => {
    io.sockets.emit(eventName, {
      userId: userId,
      msg: msg,
      sep: sep
    });
    logToConsoleAndFile(userId + sep + msg);
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
  logToConsoleAndFile(`Server running at https://localhost:${port}/`);
});
