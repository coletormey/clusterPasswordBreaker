const WebSocket = require('ws');
const packageData = require('./package.json');
const readline = require('readline');
const ip = require('ip');
const shajs = require('sha.js');

const serverIp = ip.address();

const MAX_PASSWORD_LENGTH = 4;
let startTime;

// this is for setting up user input
const lineInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Start listening for workers to connect
const server = new WebSocket.Server({
  port: packageData.port
});

// sends a message to all workers to start doing stuff
const broadcast = (data) => {
  const totalClients = server.clients.size;
  data.totalClients = totalClients;
  let i = 0;
  server.clients.forEach((client) => {
    data.i = i; // this is which number they are assigned
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data), (err) => {
        if (err) console.log(err);
      });
    }
    i++;
  });
};

// for processing user input
lineInterface.on('line', (line) => {
  const plaintextPassword = line.trim();
  if (plaintextPassword.length !== MAX_PASSWORD_LENGTH) {
    console.warn(`Passwords must be ${MAX_PASSWORD_LENGTH} characters`)
  } else if (server.clients.size === 0) {
    console.warn(`No workers connected`);
  } else {
    const hasher = new shajs.sha256();
    hasher.update(plaintextPassword);
    const hash = hasher.digest('hex'); // this is the encrypted password
    console.log(`Password cracking initialized with ${server.clients.size} nodes`);
    console.log(`plaintext password is: ${plaintextPassword}, hash is: ${hash}`);
    startTime = new Date().getTime();
    // now tell all workers to decrypt
    broadcast({
      command: 'BREAK_PASSWORD',
      hash,
    });
  }
});

// This is triggered when workers join
server.on('connection', (ws) => {
  ws.on('message', (message) => {
    // this function gets triggered when workers send messages back to the controller
    const messageData = JSON.parse(message);
    switch (messageData.command) {
      case 'PASSWORD_CRACK_COMPLETE':
        if (messageData.plaintextPassword) {
          const endTime = new Date().getTime();
          console.log(`PASSWORD HAS BEEN CRACKED: PLAINTEXT IS: ${messageData.plaintextPassword}`);
          console.log(`Took: ${endTime - startTime} ms`);
        }
        break;
      default:
        console.log('unknown command');
    }
  });
  ws.on('close', () => {
    // when a worker leaves
    console.log(`${ws._socket.remoteAddress} has disconnected, ${server.clients.size} total workers`);
  });
  console.log(`${ws._socket.remoteAddress} has connected, ${server.clients.size} total workers`);
});

console.log(`Listening at  ws:\/\/${serverIp}:${packageData.port}`);