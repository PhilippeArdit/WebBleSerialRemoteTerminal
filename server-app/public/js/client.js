// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Socket stuff
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
var socket = io();
var chatContainer = document.getElementById('chatContainer');
var chatForm = document.getElementById('chatForm');
var chatInput = document.getElementById('chatInput');

chatForm.addEventListener('submit', function (e) {
  e.preventDefault();
  if (chatInput.value) {
    socket.emit('chatMsg', chatInput.value);
    var item = document.createElement('li');
    item.className = 'out';
    item.textContent = chatInput.value;
    chatContainer.appendChild(item);
    scrollElement(chatContainer);
    chatInput.value = '';
  }
});

socket.on('chatMsg', function (msg) {
  var item = document.createElement('li');
  item.textContent = msg;
  chatContainer.appendChild(item);
  scrollElement(chatContainer);
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// BLE stuff
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

// UI elements.
const deviceName = document.getElementById('deviceName');
const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const terminalContainer = document.getElementById('terminalContainer');
const terminalForm = document.getElementById('terminalForm');
const terminalInput = document.getElementById('terminalInput');

// Helpers.
const defaultDeviceName = 'Terminal';
const terminalAutoScrollingLimit = terminalContainer.offsetHeight / 2;
const messagesAutoScrollingLimit = chatContainer.offsetHeight / 2;
let isTerminalAutoScrolling = true;
let isMessagesAutoScrolling = true;

const scrollElement = (element) => {
  const scrollTop = element.scrollHeight - element.offsetHeight;
  if (scrollTop > 0) {
    element.scrollTop = scrollTop;
  }
};

// Switch auto scrolling if it scrolls out of bottom.
terminalContainer.addEventListener('scroll', () => {
  const scrollTopOffset = terminalContainer.scrollHeight -
    terminalContainer.offsetHeight - terminalAutoScrollingLimit;
  isTerminalAutoScrolling = (scrollTopOffset < terminalContainer.scrollTop);
});

chatContainer.addEventListener('scroll', () => {
  const scrollTopOffset = chatContainer.scrollHeight -
    chatContainer.offsetHeight - messagesAutoScrollingLimit;
  isMessagesAutoScrolling = (scrollTopOffset < chatContainer.scrollTop);
});

const logToTerminal = (message, type = 'in') => {
  var item = document.createElement('li');
    item.className = type;
    item.textContent = message;
    terminalContainer.appendChild(item);
  if (isTerminalAutoScrolling) {
    scrollElement(terminalContainer);
  }
};


socket.on('termMsg', function (message, type = '') {
  logToTerminal(message, type);
});

// Obtain configured instance.
const terminal = new BluetoothTerminal();

// Override `receive` method to log incoming data to the terminal.
terminal.receive = function (message) {
  logToTerminal(message, 'in');
  socket.emit('termMsg', message);
};

// Override default log method to output messages to the terminal and console.
terminal._log = function (...chatContainer) {
  // We can't use `super._log()` here.
  chatContainer.forEach((message) => {
    logToTerminal(message);
    console.log(message); // eslint-disable-line no-console
    socket.emit('termMsg', message);
  });
};

// Implement own send function to log outcoming data to the terminal.
const send = (message) => {
  terminal.send(message).
  then(() => logToTerminal(message, 'out')).
  catch((error) => logToTerminal(error));
  socket.emit('termMsg', message);
};

// Bind event listeners to the UI elements.
connectButton.addEventListener('click', () => {
  terminal.connect().
  then(() => {
    deviceName.textContent = terminal.getDeviceName() ?
      terminal.getDeviceName() : defaultDeviceName;
  });
});

disconnectButton.addEventListener('click', () => {
  terminal.disconnect();
  deviceName.textContent = defaultDeviceName;
});

terminalForm.addEventListener('submit', (event) => {
  event.preventDefault();
  send(terminalInput.value);
  terminalInput.value = '';
  terminalInput.focus();
});
