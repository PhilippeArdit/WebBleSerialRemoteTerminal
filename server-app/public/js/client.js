// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// UI elements.
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
const chatContainer = document.getElementById('chatContainer');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const deviceName = document.getElementById('deviceName');
const connectButton = document.getElementById('connectButton');
const disconnectButton = document.getElementById('disconnectButton');
const commandButton = document.getElementById('commandButton');
const terminalButton = document.getElementById('terminalButton');
const terminalContainer = document.getElementById('terminalContainer');
const terminalForm = document.getElementById('terminalForm');
const terminalInput = document.getElementById('terminalInput');
const myNameInput = document.getElementById('myNameInput');

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Global variables
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
var socket = io(); // Socket used to transmit informations between clients thru server
var userId = ''; // The user name
var bIsConnected = false; // Someone is connected to a device
var bIAmConnected = false; // The current client is connectied to a device
var uartOrBle; // The device connected
UART.debug = 3; // Log level for BLE or Serial device (0 is no, 1 is some, 2 is more, 3 is all.)

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Submit actions
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
chatForm.addEventListener('submit', function (event) {
  event.preventDefault();
  if (chatInput.value) {
    socket.emit('chatMsg', chatInput.value);
    chatInput.value = '';
    chatInput.focus();
  }
});

terminalForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (terminalInput.value) {
    socket.emit('termMsgOut', terminalInput.value + '\n');
    terminalInput.value = '';
    terminalInput.focus();
  }
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Change my name
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
myNameInput.disabled = true;
myName.addEventListener('click', function (event) {
  myNameInput.disabled = false;
});

const changeMyName = () => {
  if (myNameInput.value.trim() == '') {
    myNameInput.focus();
  } else {
    if (myNameInput.value != userId) {
      userId = myNameInput.value;
      socket.emit('myNameIs', userId);
    }
    myNameInput.disabled = true;
  }
}
myNameInput.addEventListener('blur', function (event) {
  changeMyName();
});

myNameInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') changeMyName();
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Terminal stuff
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

const defaultDeviceName = 'Web Serial or BLE Terminal';
const terminalAutoScrollingLimit = terminalContainer.offsetHeight / 2;
const messagesAutoScrollingLimit = chatContainer.offsetHeight / 2;
let isTerminalAutoScrolling = true;
let isMessagesAutoScrolling = true;
deviceName.textContent = defaultDeviceName;

const scrollElement = (element) => {
  const scrollTop = element.scrollHeight - element.offsetHeight;
  if (scrollTop > 0) element.scrollTop = scrollTop;
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

const addLi = (message, type = 'in') => {
  var item = document.createElement('li');
  item.className = type;
  item.textContent = message;
  terminalContainer.appendChild(item);
  if (isTerminalAutoScrolling) scrollElement(terminalContainer);

}
var strBuf = '';
var timeoutId;
const appendToTerminal = (message, type = 'in') => {
  // Clear the order to write the end of the buffer if any
  if (timeoutId) clearTimeout(timeoutId);

  if (type == 'in') {
    // Writes line by line
    strBuf += message;
    var t = strBuf.split('\n');
    var i = 0;
    strBuf = t[t.length - 1];
    while (i < t.length - 1) {
      addLi(t[i], type);
      i++;
    };

    // In case of text not ending with EOL
    // ask to print the end of the buffer
    timeoutId = setTimeout(() => {
      addLi(t[t.length - 1], type);
      strBuf = '';
    }, 500)

  } else {
    addLi(message, type);
  }
};

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Socket events
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

socket.on('chatMsg', function (jsonObj) {
  var item = document.createElement('li');
  item.textContent = jsonObj.msg;
  if (jsonObj.userId == userId)
    item.className = 'out';
  else
    item.textContent = jsonObj.userId + jsonObj.sep + item.textContent;
  chatContainer.appendChild(item);
  scrollElement(chatContainer);
});

socket.on('connectInfo', function (jsonObj) {
  userId = jsonObj.userId;
  myNameInput.value = userId;
});

socket.on('termDataIn', function (jsonObj) {
  appendToTerminal(jsonObj.msg, 'in');
});

socket.on('termMsgOut', function (jsonObj) {
  if (bIAmConnected) uartOrBle.write(jsonObj.msg + '\n', function () {});
  appendToTerminal((jsonObj.userId == userId ? '' : jsonObj.userId + jsonObj.sep) + jsonObj.msg, 'out');
});

socket.on('termToggleConnected', function (jsonObj) {
  appendToTerminal((jsonObj.userId == userId ? '' : jsonObj.userId + jsonObj.sep) + jsonObj.msg + ' is ' + (bIsConnected ? '' : 'dis') + 'connected', 'in');
  deviceName.textContent = bIsConnected ?
    (jsonObj.userId == userId ? 'C' : jsonObj.userId + " is c") + 'onnected to ' + jsonObj.msg :
    defaultDeviceName;
  setConnectedUI(bIsConnected);
});

// Set initial UI state
const setConnectedUI = (b) => {
  disconnectButton.style.display = b && bIAmConnected ? '' : 'none';
  connectButton.style.display = b ? 'none' : '';
  terminalButton.disabled = !b;
  terminalInput.disabled = !b;
  commandButton.disabled = !b;
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Does someone else is already 
// connected to a device  ?
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
socket.on('isTermConnected', function (jsonObj) {
  if (jsonObj.msg == '?' && bIAmConnected) {
    socket.emit('isTermConnected', bIAmConnected);
  } else {
    if (jsonObj.msg === true) bIsConnected = true;
    if (jsonObj.msg === false) bIsConnected = false;
  }
  setConnectedUI(bIsConnected);
});
socket.timeout(1000).emit('isTermConnected', '?')

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Who is connected ?
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
socket.on('whoIsConnected', function (jsonObj) {
  if (jsonObj.msg == '?') socket.emit('chatMsg', 'I am connected');
});
socket.timeout(1000).emit('whoIsConnected', '?')

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Disconnect button
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

disconnectButton.addEventListener('click', () => {
  uartOrBle.close();
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Connect button using UART object
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

connectButton.addEventListener('click', () => {
  if (!UART.checkIfSupported()) {
    // modal
    var modalDiv = document.createElement('div');
    modalDiv.style = 'position:absolute;top:0px;left:0px;right:0px;bottom:0px;opacity:0.5;z-index:100;background:black;';
    // menu
    var menu = document.createElement('div');
    menu.style = 'position:absolute;left:15%;top:15%;width:75%;height:75%;font-family: Sans-Serif;z-index:101;';
    var menuTitle = document.createElement('div');
    menuTitle.innerHTML = '<span>Unsupported computer or browser</span><span style="float:right;">Close</span>';
    menuTitle.style = 'color:#fff;background:#000;padding:8px 8px 4px 8px;font-weight:bold;cursor:pointer;';
    menu.appendChild(menuTitle);
    var items = document.createElement('div');
    items.style = 'color:#000;background:#fff;padding:4px 8px 4px 8px;overflow:auto;height:85%;';
    menu.appendChild(items);
    var ep = document.createElement('div');
    ep.style = 'background:#ccc;margin:4px 0px 4px 0px;padding:10px 10px 10px 10px;';
    ep.innerHTML = '<h2>Hardware</h2>' +
      '<p>For Bluetooth LE you need a Bluetooth 4.0-capable adaptor in your computer (Bluetooth versions before 4.0 won&#39;t work). Pretty much all new computers come with Bluetooth 4, but you <em>may</em> need to get an external Bluetooth LE dongle if your computer:</p>' +
      '<ul>' +
      '<li>Is an Apple Mac made before 2012</li>' +
      '<li>Is a Windows PC with a Windows version before 10</li>' +
      '<li>Is a Desktop PC - it may not have any wireless support <em>at all</em></li>' +
      '<li>Is running Linux - much of the built-in Bluetooth LE functionality in laptops is still buggy. External USB adaptors will be much more reliable.</li>' +
      '</ul>' +
      '<p>If your computer doesn&#39;t have Bluetooth LE then Bluetooth LE USB adaptors and small, cheap (~$10), and easily available. There are two main types of USB Bluetooth Adaptor available:</p>' +
      '<ul>' +
      '<li><strong>Broadcom chipset</strong> (eg. BCM20702) works well on all platforms.</li>' +
      '<li><strong>Cambridge Silicon Radio (CSR)</strong> - these work great on Linux and Windows. However while they used to work on Macs, <em>Apple removed support in the High Sierra OS update</em> - so you&#39;re better off with a Broadcom module.</li>' +
      '</ul>' +
      '<p>To be sure that you get a usable adaptor we&#39;d recommend that you buy ONLY adaptors that explicitly mention <code>CSR</code> or <code>Broadcom</code> in the descriptuon. <strong>The BlueGiga BLED112 module WILL NOT WORK</strong> - it is a serial port device, not a general purpose Bluetooth adaptor.</p>' +
      '<p>Common USB Bluetooth adaptors that have been tested and work are:</p>' +
      '<ul>' +
      '<li><a target="_blank" href="https://www.amazon.com/gp/product/B01J3AMITS">iAmotus UD-400M</a> - Broadcom BCM20702A1</li>' +
      '<li><a target="_blank" href="https://www.amazon.com/gp/product/B009ZIILLI">Plugable USB-BT4LE</a> - Broadcom BCM20702A1</li>' +
      '<li><a target="_blank" href="https://shop.espruino.com/ble/usb-bluetooth">Feasycom FSC-BP119</a> - CSR chipset <strong>with external antenna</strong></li>' +
      '<li><a target="_blank" href="https://www.amazon.com/gp/product/B01AXGYS30">Whitelabel 06Q Nano</a> - CSR chipset</li>' +
      '<li><a target="_blank" href="https://www.amazon.com/gp/product/B01J35AUS4">Whitelabel BM35</a> - CSR chipset</li>' +
      '<li><a target="_blank" href="https://www.amazon.com/dp/product/B0775YF36R">Unbranded &#39;CSR 4.0&#39;</a> - CSR Chipset</li>' +
      '</ul>' +
      '<h2>Software</h2>' +
      '' +
      '<p>If your computer supports it, Web Bluetooth is the easiest way to get started here.</p>' +
      '<p>You&#39;ll need an up to date version of <a target="_blank" href="https://www.google.com/chrome/browser/desktop/">Google Chrome</a>, Edge or Opera Web Browsers on one of:</p>' +
      '<h4>Mac OS</h4>' +
      '<p>OS X Yosemite or later required, and check that your Mac supports Bluetooth Low Energy:</p>' +
      '<ul>' +
      '<li>Click the Apple logo then <code>About this Mac</code> in the top left</li>' +
      '<li>Click <code>System Report</code></li>' +
      '<li>Click <code>Bluetooth</code> under <code>Hardware</code></li>' +
      '<li>See if it says <code>Bluetooth Low Energy Supported</code></li>' +
      '</ul>' +
      '<p>If it doesn&#39;t:</p>' +
      '<ul>' +
      '<li>Get a Bluetooth 4.0 (or later) adaptor (they cost ~$10) - see the requirements section above.</li>' +
      '<li>Open a terminal and type <code>sudo nvram bluetoothHostControllerSwitchBehavior=al­ways</code>' +
      '(to go back to the old behaviour type <code>sudo nvram -d bluetoothHostControllerSwitchBehavior</code>)</li>' +
      '<li>Reboot your Mac</li>' +
      '<li><strong>Make sure that you turn off (or un-pair) any Bluetooth devices that were using your internal Bluetooth</strong> - they may stop your Mac from using the new adaptor</li>' +
      '</ul>' +
      '<p>If the Web Bluetooth option appears but you&#39;re unable to see any Bluetooth devices,' +
      'try: <code>System Preferences</code> —&gt; <code>Security &amp; Privacy</code> —&gt; <code>Bluetooth</code> -&gt; Add <code>Google Chrome</code></p>' +
      '<h4>Windows</h4>' +
      '<p>Windows 10 fully supports Web Bluetooth, as long as you have an up to date' +
      'version of <a target="_blank" href="https://www.google.com/chrome/browser/desktop/">Google Chrome</a> (v70 or above) and your PC has a Bluetooth LE' +
      'radio (all new Laptops will).</p>' +
      '<p>If you do not have Windows 10...</p>' +
      '<h4>Linux</h4>' +
      '<p>Linux is not officially supported in Chrome.  However, because ChromeOS is supported it can be possible to enable Linux support:</p>' +
      '<p>BlueZ 5.41+ required (5.43 is more stable) - you can check by typing <code>bluetoothd --version</code>. If it isn&#39;t there are some <a target="_blank" href="/Web+Bluetooth+On+Linux">Bluez installation instructions here</a></p>' +
      '<ul>' +
      '<li>Type <code>chrome://flags</code> in the address bar</li>' +
      '<li>You need to enable <code>Experimental Web Platform Features</code> (<code>chrome://flags/#enable-experimental-web-platform-features</code>).</li>' +
      '<li>Also enable <code>Use the new permissions backend for Web Bluetooth</code> (<code>chrome://flags/#enable-web-bluetooth-new-permissions-backend</code>) if it exists</li>' +
      '<li>Restart your browser</li>' +
      '</ul>' +
      '<h4>Chromebook</h4>' +
      '<p>All Chromebooks with Bluetooth should support Web Bluetooth.</p>' +
      '<h4>Android</h4>' +
      '<p>Android 6 (Marshmallow) or later are supported out of the box.</p>' +
      '<p>Android 5 (Lollipop) devices can use <a target="_blank" href="https://stackoverflow.com/questions/34810194/can-i-try-web-bluetooth-on-chrome-for-android-lollipop">Chromium installed over ADB to a developer mode device</a>.</p>' +
      '<h4>iOS (iPhone, iPad)</h4>' +
      '<p>Apple&#39;s built-in web browser does not support Web Bluetooth. Instead you&#39;ll' +
      'need to <a target="_blank" href="https://itunes.apple.com/us/app/webble/id1193531073">install the WebBLE app</a></p>' +
      '<p>Once that is done you&#39;ll be able to access Web Bluetooth through any' +
      'webpage viewed with <a target="_blank" href="https://itunes.apple.com/us/app/webble/id1193531073">WebBLE</a></p>';

    menuTitle.onclick = function (evt) {
      document.body.removeChild(menu);
      document.body.removeChild(modalDiv);
    };
    items.appendChild(ep);
    document.body.appendChild(modalDiv);
    document.body.appendChild(menu);
    return;
  } else {
    UART.connect(function (connection) {
      if (!connection) throw "Error!";

      connection.on('data', function (msg) {
        socket.emit('termDataIn', msg.replace('\r\n', '\n'));
      });

      function _setConnectedUI(b) {
        bIAmConnected = bIsConnected = b;
        socket.emit('isTermConnected', b);
        socket.emit('termToggleConnected', connection.deviceName);
      }

      connection.on('open', function () {
        _setConnectedUI(true);
      });

      connection.on('close', function () {
        _setConnectedUI(false);
      });

      uartOrBle = connection;
    });
  }
});

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
// Commands helper
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=

commandButton.addEventListener('click', () => {

  // modal
  var modalDiv = document.createElement('div');
  modalDiv.style = 'position:absolute;top:0px;left:0px;right:0px;bottom:0px;opacity:0.5;z-index:100;background:black;';
  // menu
  var menu = document.createElement('div');
  menu.style = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-family: Sans-Serif;z-index:101;max-height:75%;overflow:auto;';

  var menuTitle = document.createElement('div');
  menuTitle.innerHTML = '<span>Select a command...</span><span style="float:right;">Close</span>';
  menuTitle.style = 'color:#fff;background:#000;padding:8px 8px 4px 8px;font-weight:bold;cursor:pointer;';
  menu.appendChild(menuTitle);

  var items = document.createElement('div');
  items.style = 'color:#000;background:#fff;padding:4px 8px 4px 8px;';
  menu.appendChild(items);

  commands.forEach(function (command) {
    command.item = document.createElement('div');
    command.item.style = 'min-width:300px;min-height:50px;background:#ccc;margin:4px 0px 4px 0px;padding:0px 10px 10px 10px;cursor:pointer;';
    command.item.innerHTML =
      '<div style="font-size:150%;padding-top:8px;">' + command.name + '</div>' +
      '<div style="font-size:80%;color:#666;">' + command.description + '</div>';
    command.item.onclick = function (evt) {
      evt.preventDefault();
      if (command.subCommands) {
        var bDelete = command.subItems ? true : false;

        if (!bDelete) {
          command.subItems = document.createElement('div');
          command.subItems.style = 'color:#000;background:#fff;padding:4px 8px 4px 8px;';
          command.item.appendChild(command.subItems);
        }
        command.subCommands.forEach(function (subCommand) {
          if (bDelete) {
            command.subItems.removeChild(subCommand.subItem);
            subCommand.subItem = undefined;
          } else {
            subCommand.subItem = document.createElement('div');
            subCommand.subItem.style = 'min-height:50px;background:#ccc;margin:4px 0px 4px 0px;padding:0px 0px 0px 10px;cursor:pointer;';
            subCommand.subItem.innerHTML =
              '<div style="font-size:150%;padding-top:8px;">' + subCommand.name + '</div>' +
              '<div style="font-size:80%;color:#666;">' + subCommand.description + '</div>';
            subCommand.subItem.onclick = function (subEvt) {
              subEvt.preventDefault();
              subEvt.stopPropagation();
              terminalInput.value = (command.evalJs ? eval(command.value) : command.value) + ' ' + (subCommand.evalJs ? eval(subCommand.value) : subCommand.value);
              closeCommandMenu();
            }
            command.subItems.appendChild(subCommand.subItem);
          }
        });
        if (bDelete) {
          command.item.removeChild(command.subItems);
          command.subItems = undefined;
        }
      } else {
        terminalInput.value = command.evalJs ? eval(command.value) : command.value;
        closeCommandMenu();
      }
    }
    items.appendChild(command.item);
  });

  const closeCommandMenu = () => {
    commands.forEach(function (command) {
      if (command.subCommands) {
        command.subCommands.forEach(function (subCommand) {
          if (subCommand.subItem) command.subItems.removeChild(subCommand.subItem);
          subCommand.subItem = undefined;
        });
      }
      if (command.subItems) command.item.removeChild(command.subItems);
      command.subItems = undefined;

      items.removeChild(command.item);
    });

    menu.removeChild(items);
    menu.removeChild(menuTitle);
    document.body.removeChild(menu);
    document.body.removeChild(modalDiv);
  }

  menuTitle.onclick = function (evt) {
    closeCommandMenu();
  };

  document.body.appendChild(modalDiv);
  document.body.appendChild(menu);
});