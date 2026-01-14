const yws = require('y-websocket');
console.log('Exports:', Object.keys(yws));
try {
    const utils = require('y-websocket/bin/utils');
    console.log('Bin/Utils found');
} catch (e) {
    console.log('Bin/Utils NOT found');
}
