'use strict';

var fs = require('fs');
var path = require('path');
var debug = require('debug')('coffee');
var Coffee = require('./lib/coffee');

// inject script supporting istanbul with multiple process
if (process.env.running_under_istanbul) {
  process.env.istanbul_bin_path = findIstanbul();
  require('childprocess').inject(path.join(__dirname, 'lib/inject_istanbul.js'));
}

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

// where is istanbul
function findIstanbul(opt) {
  if (/\/istanbul$/.test(process.env._)) {
    debug('find istanbul %s', process.env._);
    return process.env._;
  }

  var filepath;
  var entryBin = require.resolve(process.env._);
  var dirs = [];

  // $PWD
  dirs.push(process.cwd());
  // depended by some tools
  dirs.push(path.join(entryBin, '..'));
  dirs.push(path.join(entryBin, '../..'));
  // specified $PWD
  opt && opt.cwd && dirs.push(opt.cwd);

  for (var i = 0, l = dirs.length; i < l; i++) {
    filepath = path.join(dirs[i], 'node_modules/.bin/istanbul');
    debug('find istanbul %s', filepath);
    if (fs.existsSync(filepath)) {
      return filepath;
    }
  }
  return '';
}
