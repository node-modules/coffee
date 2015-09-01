'use strict';

var Coffee = require('./lib/coffee');

exports.Coffee = Coffee;

/**
 * fork a child process to test
 * @param {String} modulePath
 * @param {Array} args
 * @param {Object} opt - fork options
 *  - {Boolean} autoCoverage - auto set cover code when `istanbul cover` running
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
