const mm = require('mm');
const os = require('os');

mm(os, 'homedir', () => '/some/home/dir');
