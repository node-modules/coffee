'use strict';

var fs = require('fs');
var path = require('path');
var debug = require('debug')('coffee');

// where is istanbul
module.exports = function findIstanbul(opt) {
  if (process.env.istanbul_bin_path) {
    return process.env.istanbul_bin_path;
  }
  if (/\/istanbul$/.test(process.env._)) {
    debug('find istanbul %s', process.env._);
    return process.env._;
  }

  var filepath;
  var dirs = [];

  // $PWD
  dirs.push(process.cwd());

  // depended by some tools
  try {
    if (process.env._) {
      var entryBin = require.resolve(process.env._);
      dirs.push(path.join(entryBin, '..'));
      dirs.push(path.join(entryBin, '../..'));
    }
  } catch (_) {
    // do nothing
  }
  // specified $PWD
  opt && opt.cwd && dirs.push(opt.cwd);

  for (var i = 0, l = dirs.length; i < l; i++) {
    filepath = path.join(dirs[i], 'node_modules/.bin/istanbul');
    debug('finding istanbul %s', filepath);
    if (fs.existsSync(filepath)) {
      debug('found istanbul %s', filepath);
      return filepath;
    }
  }
  return '';
};
