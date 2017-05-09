'use strict';

var path = require('path');
var findIstanbul = require('./lib/find_istanbul');
var Coffee = require('./lib/coffee');

// child process always use the cwd of the main process
process.env.coffee_cwd = process.cwd();
// inject script supporting istanbul with multiple process
process.env.istanbul_bin_path = findIstanbul();
require('childprocess').inject(path.join(__dirname, 'lib/inject_istanbul.js'));

exports.Coffee = Coffee;

/**
 * fork a child process to test
 * @param {String} modulePath - The module to run in the child
 * @param {Array} args - List of string arguments
 * @param {Object} opt - fork options
 * @see https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options
 * @return {Coffee} coffee instance
 */
exports.fork = function(modulePath, args, opt) {
  return new Coffee({
    method: 'fork',
    cmd: modulePath,
    args,
    opt,
  });
};

/**
 * spawn a child process to test
 * @param  {String} cmd - The command to run
 * @param  {Array} args - List of string arguments
 * @param  {Object} opt - spawn options
 * @return {Coffee} coffee instance
 */
exports.spawn = function(cmd, args, opt) {
  return new Coffee({
    method: 'spawn',
    cmd,
    args,
    opt,
  });
};
