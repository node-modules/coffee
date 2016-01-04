'use strict';

var path = require('path');
var findIstanbul = require('./lib/find_istanbul');
var Coffee = require('./lib/coffee');

// inject script supporting istanbul with multiple process
process.env.istanbul_bin_path = findIstanbul();
require('childprocess').inject(path.join(__dirname, 'lib/inject_istanbul.js'));

exports.Coffee = Coffee;

/**
 * fork a child process to test
 * @param {String} modulePath
 * @param {Array} args
 * @param {Object} opt - fork options
 * @return {Coffee}
 */
exports.fork = function(modulePath, args, opt) {
  return new Coffee({
    method: 'fork',
    cmd: modulePath,
    args: args,
    opt: opt
  });
};

exports.spawn = function(cmd, args, opt) {
  return new Coffee({
    method: 'spawn',
    cmd: cmd,
    args: args,
    opt: opt
  });
};
