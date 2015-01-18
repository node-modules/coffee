'use strict';

var cp = require('child_process');
var assert = require('assert');
var debug = require('debug')('coffee');
var assertion = require('./assert');
var show = require('./show');

module.exports = Coffee;

function Coffee(opt) {
  opt || (opt = {});
  assert(opt.method && opt.cmd, 'should specify method and cmd');
  this.method = opt.method;
  this.cmd = opt.cmd;
  this.args = opt.args;
  this.opt = opt.opt;
  this.restore();
}

// Only accept these type below for assertion
var acceptType = ['stdout', 'stderr', 'code'];
Coffee.prototype.expect = function(type, value) {
  assert(!this._isEndCalled, 'can\'t call expect after end');
  if (acceptType.indexOf(type) > -1) {
    this.waitAssert[type].push(value);
  }
  return this;
};

/*
  Write data to stdin of the command
*/

Coffee.prototype.write = function(value) {
  assert(!this._isEndCalled, 'can\'t call write after end');
  this.stdin.push(value);
  return this;
};

Coffee.prototype.end = function(cb) {
  this._isEndCalled = true;
  var self = this, cmd = run(this.method, this.cmd, this.args, this.opt);

  cmd.stdout.on('data', function(buf) {
    debug('output stdout `%s`', show(buf));
    self.stdout += buf;
  });

  cmd.stderr.on('data', function(buf) {
    debug('output stderr `%s`', show(buf));
    self.stderr += buf;
  });

  if (this.stdin.length) {
    this.stdin.forEach(function(buf) {
      debug('input stdin `%s`', show(buf));
      cmd.stdin.write(buf);
    });
    cmd.stdin.end();
  }

  cmd.on('close', function (code) {
    debug('output code `%s`', show(self.code));
    self.code = code;
    try {
      assertion(self.waitAssert.stdout, self.stdout, 'should match stdout');
      assertion(self.waitAssert.stderr, self.stderr, 'should match stderr');
      assertion(self.waitAssert.code, self.code, 'should match code');
      done();
    } catch(err) {
      done(err);
    }
  });

  return this;

  function done(err) {
    self.complete = true;
    if (cb) cb(err);
  }
};

Coffee.prototype.restore = function() {
  // cache input for command
  this.stdin = [];

  // cache output for command
  this.stdout = '';
  this.stderr = '';
  this.code = null;

  // cache expected output
  this.waitAssert = {
    stderr: [],
    stdout: [],
    code: []
  };
  this.complete = false;
  this._isEndCalled = false;
  return this;
};

function run(method, cmd, args, opt) {
  args = args || [];
  opt = opt || {};

  // Force pipe to parent
  if (method === 'fork') {
    // Boolean If true, stdin, stdout, and stderr of the child will be piped to the parent,
    // otherwise they will be inherited from the parent
    opt.silent = true;
  }

  debug('child_process.%s("%s", [%s], %j)', method, cmd, args, opt);
  return cp[method](cmd, args, opt);
}
