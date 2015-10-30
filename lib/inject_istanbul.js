'use strict';

module.exports = function(modulePath, args, opt) {
  if (!process.env.istanbul_bin_path) {
    console.warn('istanbul bin is not found');
    return [modulePath, args, opt];
  }

  if (!opt && typeof args !== 'array') {
    opt = args;
    args = [];
  }

  var istanbulBin = process.env.istanbul_bin_path;
  var istanbulArgs = [
    'cover',
    '--report', 'none',
    '--print', 'none',
    '--include-pid',
    modulePath,
  ];
  if (args && args.length) {
    istanbulArgs.push('--');
    istanbulArgs = istanbulArgs.concat(args);
  }
  return [istanbulBin, istanbulArgs, opt];
};
