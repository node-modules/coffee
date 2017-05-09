'use strict';

var path = require('path');

module.exports = function(modulePath, args, opt) {
  if (process.env.coffee_inject_istanbul === 'false') {
    return [ modulePath, args, opt ];
  }
  if (!process.env.istanbul_bin_path) {
    console.warn('istanbul bin is not found');
    return [ modulePath, args, opt ];
  }

  var cwd = process.env.coffee_cwd;
  var istanbulBin = process.env.istanbul_bin_path;
  var istanbulArgs = [
    'cover',
    '--report', 'none',
    '--print', 'none',
    '--include-pid',
    '--root', cwd,
    '--dir', path.join(cwd, 'coverage'),
    modulePath,
  ];
  if (args && args.length) {
    istanbulArgs.push('--');
    istanbulArgs = istanbulArgs.concat(args);
  }
  return [ istanbulBin, istanbulArgs, opt ];
};
