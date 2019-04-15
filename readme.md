# Websocket Demo

## Super simple clusterable password breaker
Basic idea is to figure out how many password combinations there are for a given password, then try all combinations. 
When a password is stored, it is stored as a hash, not plaintext. When trying to crack a password, you start with the hash of the target password, and try to hash all possible passwords until both hashes are equal.

Hashing part in in `crack_password.cpp`. Uses a javascript driver to do some simple clustering. Start the controller and at least 1 worker. When more than 1 workers are attached, each worker will attempt an equal portion of available passwords. Next type a 4 letter password into the controller. It will hash it, and broadcast it to the workers who will attempt to reverse the hash.

For this simple demo, we assume that a password is 4 letters long, and consists of the letters a-z. Combos range from aaaa-zzzz.

### Possible ideas to extend
- add threads to each node
- handle a password with a-z, A-Z, 0-9 and special characters
- add gpu to each node
- break into smaller chunks and have workers request chunks on demand (Faster machines will get through chunks quicker)

## Installing
Make sure you have node installed first. If you don't have it, get it from here: https://nodejs.org/en/


Demo uses WebSocket which is a TCP protocol.
You can find more information [here](https://tools.ietf.org/html/rfc6455) and  [here](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API). Note the mozilla one is not the one we are using, that one is for browsers. This can also work in the browser (Currently only way to maintain tcp connection in browser)

Once you have that, run this command in the directory
Run the submodule command to get the linked git repos (for hashing)
```
npm install
git submodule update --init --recursive
```

To start the controller
```
node controller.js
```
To start a worker.
```
node worker.js <ip optional>
```
Starting the worker with no ip will default to localhost.

## Native Bindings
```
npm install -g node-gyp
```
If you are on windows you might need [this](https://www.npmjs.com/package/windows-build-tools)

install with this:
```
npm install --global --production windows-build-tools
```

To configure
```
node-gyp configure
```

And to build c++
```
node-gyp build
```