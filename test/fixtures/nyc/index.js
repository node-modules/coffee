'use strict';

const path = require('path');
const cp = require('child_process');
cp.fork(path.join(__dirname, 'child.js'), ['b', 'c'], {stdio: 'pipe'});
