const WebSocket = require('ws');
const packageData = require('./package.json');
const addon = require('./build/Release/addon');

const ip = require('ip');

const clientIp = ip.address();

let host = 'localhost';
// if you type in another address you can join up multiple machines
if (process.argv.length === 3) {
  host = process.argv[2];
}

const address = `ws:\/\/${host}:${packageData.port}`;
console.log(`connecting to ${address}`);
console.log(`client ip is ${clientIp}`);
const socket = new WebSocket(address);

socket.on('open', (ws) => {
  console.log('connected');
});

socket.on('message', (message) => {
  const messageData = JSON.parse(message);
  console.log(message);
  switch (messageData.command) {
    case 'BREAK_PASSWORD':
      // attempt to break password
      const result = addon.crackPassword(messageData.hash, messageData.i, messageData.totalClients);
      socket.send(JSON.stringify({
        command: 'PASSWORD_CRACK_COMPLETE',
        plaintextPassword: result.plaintextPassword,
      }));
      break;
    default:
      console.log(`${messageData.command} not recognized`);
  }
});

socket.on('close', () => {
  console.log('connection closed');
});
