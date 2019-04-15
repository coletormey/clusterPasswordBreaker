const addon = require('./build/Release/addon');
const shajs = require('sha.js');

const password = 'zzzz';
const hash = (new shajs.sha256().update(password).digest('hex'));

const result = addon.crackPassword(hash, 0, 1);
console.log(result);
console.log(`password was cracked: ${result.plaintextPassword === password}`);