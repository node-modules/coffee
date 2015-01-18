'use strict';

var Coffee = require('./lib/coffee');

exports.Coffee = Coffee;

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
