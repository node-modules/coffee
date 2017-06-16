'use strict';

const path = require('path');
const cp = require('child_process');
cp.fork(path.join(__dirname, 'grandchild.js'), process.argv.slice(2), {stdio: 'pipe'});
