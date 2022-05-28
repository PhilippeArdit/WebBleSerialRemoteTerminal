// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// NodeJS with Express framework
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const express = require('express');
const app = express();

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Define HTTP server and port
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const https = require('https');
const fs = require('fs');
const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cer')
};
const server = https.createServer(options, app);
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
io.on('connection', (socket) => {
  const userId = '(' + socket.handshake.query.t /* + socket.handshake.issued */ + ')';

  socket.broadcast.emit('chatMsg', userId + ' is connected');
  logToConsoleAndFile(userId + ' is connected');

  socket.on('disconnect', () => {
    socket.broadcast.emit('chatMsg', userId + ' is disconnected');
    logToConsoleAndFile(userId + ' is disconnected');
  });

  socket.on('chatMsg', (msg) => {
    const _msg = userId + ' > ' + msg;
    socket.broadcast.emit('chatMsg', _msg);
    logToConsoleAndFile(_msg);
  });

  socket.on('termMsgOut', (msg) => {
    const _msg = userId + ' > ' + msg;
    socket.broadcast.emit('termMsgOut', _msg);
    logToConsoleAndFile(_msg);
  });
  socket.on('termDataIn', (msg) => {
    _msg = msg.replace('\r\n', '\n');
    socket.broadcast.emit('termDataIn', _msg);
    logToConsoleAndFile(_msg);
  });

  socket.on('termToggleConnected', function (msg) {
    const _msg = userId + ' > ' + msg;
    socket.broadcast.emit('termToggleConnected', _msg);
    logToConsoleAndFile(_msg);
  });

  socket.on('termIsConnected', function (msg) {
    io.sockets.emit('termIsConnected', msg);
    logToConsoleAndFile('termIsConnected ' + msg);
  });

  socket.onAny((event, ...args) => {
    if (`${event}` != 'termDataIn' &&
      `${event}` != 'termMsgOut' &&
      `${event}` != 'termToggleConnected' &&
      `${event}` != 'termIsConnected' &&
      `${event}` != 'chatMsg')
      logToConsoleAndFile(`received unknown event : ${event}`);
  });

});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Launch HTTP Server
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
server.listen(port, () => {
  logToConsoleAndFile(`Server running at https://localhost:${port}/`);
});