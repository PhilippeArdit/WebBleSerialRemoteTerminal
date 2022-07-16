// List of supported BLE devices

// Cf. https://github.com/DFRobot/BlunoBasicDemo
const DF_Robot_Service_Id = "0000dfb0-0000-1000-8000-00805f9b34fb";
const DF_Robot_Characteristics_Serial_Port_Id = "0000dfb1-0000-1000-8000-00805f9b34fb";
const DF_Robot_Characteristics_Command_Id = "0000dfb2-0000-1000-8000-00805f9b34fb";

const bleServiceDescriptionList = [{
    name: 'Bangle/Puck.js',
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    rxUUID: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
    txUUID: '6e400002-b5a3-f393-e0a9-e50e24dcca9e'
  },
  {
    name: 'DF Robot Bluno Mega 2560/Exomo1',
    serviceUUID: DF_Robot_Service_Id,
    rxUUID: DF_Robot_Characteristics_Serial_Port_Id,
    txUUID: DF_Robot_Characteristics_Serial_Port_Id
  },
  {
    name: 'Exomo2',
    serviceUUID: '0000ffe0-0000-1000-8000-00805f9b34fb',
    rxUUID: '0000ffe1-0000-1000-8000-00805f9b34fb',
    txUUID: '0000ffe1-0000-1000-8000-00805f9b34fb'
  }
];

// List of Serial supported devices
const SerialFilters = [{
    name: 'Exomo2',
    usbVendorId: 1027,
    usbProductId: 24577
  },
  {
    name: 'Bluno Mega 2560/Exomo1',
    usbVendorId: 9025,
    usbProductId: 66
  },
  {
    name: 'Espruino Pico',
    usbVendorId: 1155,
    usbProductId: 22336
  }
];