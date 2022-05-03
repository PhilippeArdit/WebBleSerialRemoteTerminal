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
  logToFile(msg, 'logs/app.log');
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
  logToConsoleAndFile("socket.handshake : " + JSON.stringify(socket.handshake));
  const userId = ' (' + socket.handshake.query.t /* + socket.handshake.issued */ + ') ';

  socket.broadcast.emit('chat message', userId + 'connected');
  logToConsoleAndFile('broadcast chat message' + userId + 'connected');

  socket.on('disconnect', () => {
    socket.broadcast.emit('chat message', userId + 'disconnected');
    logToConsoleAndFile('broadcast chat message' + userId + 'disconnected');
  });
  socket.on('chat message', (msg) => {
    socket.broadcast.emit('chat message', userId + msg);
    logToConsoleAndFile('broadcast chat message' + userId + msg);
  });
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Launch HTTP Server
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
server.listen(port, () => {
  logToConsoleAndFile(`Server running at https://localhost:${port}/`);
});