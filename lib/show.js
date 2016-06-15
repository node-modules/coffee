'use strict';

module.exports = function show(obj) {
  if (obj instanceof Buffer) {
    obj = obj.toString();
  }
  // escape \n to \\n for good view in terminal
  return (typeof obj === 'string' ? obj.replace(/\n/g, '\\n') : obj) +
    '(' + {}.toString.call(obj).replace(/^\[object (.*)\]$/, '$1') + ')';
};
