'use strict';

var util = require('util');
var EventEmitter = require('events');
var cp = require('child_process');
var assert = require('assert');
var debug = require('debug')('coffee');
var assertion = require('./assert');
var show = require('./show');
var Rule = require('./rule');

// init coffee_inject_istanbul env
process.env.coffee_inject_istanbul = 'false';

module.exports = Coffee;

function Coffee(opt) {
  EventEmitter.call(this);
  opt || (opt = {});
  assert(opt.method && opt.cmd, 'should specify method and cmd');
  this.method = opt.method;
  this.cmd = opt.cmd;
  this.args = opt.args;
  this.opt = opt.opt;
  this.restore();

  var self = this;
  this.on('stdout_data', function(buf) {
    debug('output stdout `%s`', show(buf));
    self._debug_stdout && process.stdout.write(buf);
    self.stdout += buf;
  });
  this.on('stderr_data', function(buf) {
    debug('output stderr `%s`', show(buf));
    self._debug_stderr && process.stderr.write(buf);
    self.stderr += buf;
  });
  this.on('error', function(err) {
    self.error = err;
  });
  this.once('close', function(code) {
    // restore coffee_inject_istanbul
    process.env.coffee_inject_istanbul = 'false';
    debug('output code `%s`', show(code));
    self.code = code;
    try {
      assertion(self.waitAssert.stdout, self.stdout, 'match stdout');
      assertion(self.waitAssert.stderr, self.stderr, 'match stderr');
      assertion(self.waitAssert.code, self.code, 'match code');
      self.error && assertion(self.waitAssert.error, self.error.message, 'match error message');
    } catch (err) {
      return done(err);
    }
    done();
  });
  function done(err) {
    self.complete = true;
    if (self.cb) {
      self.cb.call(self, err, {
        stdout: self.stdout,
        stderr: self.stderr,
        code: self.code,
        error: self.error,
      });
    } else {
      if (err) {
        self.emit('complete_error', err);
      } else {
        self.emit('complete_success', {
          stdout: self.stdout,
          stderr: self.stderr,
        });
      }
    }
  }

  if (process.env.COFFEE_DEBUG) {
    this.debug(process.env.COFFEE_DEBUG);
  }

  process.nextTick(this._run.bind(this));
}

util.inherits(Coffee, EventEmitter);

Coffee.prototype.coverage = function(isCoverage) {
  if (isCoverage === false) {
    this._isCoverage = false;
  }
  return this;
};

Coffee.prototype.debug = function(level) {
  this._debug_stdout = false;
  this._debug_stderr = false;

  // 0 (default) -> stdout + stderr
  // 1 -> stdout
  // 2 -> stderr
  switch (String(level)) {
    case '1':
      this._debug_stdout = true;
      break;
    case '2':
      this._debug_stderr = true;
      break;
    case 'false':
      this._debug_stdout = false;
      this._debug_stderr = false;
      break;
    default:
      this._debug_stdout = true;
      this._debug_stderr = true;
  }

  return this;
};

// Only accept these type below for assertion
var acceptType = [ 'stdout', 'stderr', 'code', 'error' ];

Coffee.prototype.expect = function(type, value) {
  if (acceptType.indexOf(type) > -1) {
    var rule = new Rule(value);
    if (this.complete) {
      assertion([ rule ], this[type], 'match ' + type);
    } else {
      this.waitAssert[type].push(rule);
    }
  }
  return this;
};

Coffee.prototype.notExpect = function(type, value) {
  if (acceptType.indexOf(type) > -1) {
    var rule = new Rule(value, true);
    if (this.complete) {
      assertion([ rule ], this[type], 'match ' + type);
    } else {
      this.waitAssert[type].push(rule);
    }
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
  this.cb = cb;
  if (!cb) {
    return new Promise((resolve, reject) => {
      this.on('complete_success', resolve);
      this.on('complete_error', reject);
    });
  }
};

Coffee.prototype._run = function() {
  this._isEndCalled = true;
  // inject istanbul when start with istanbul and set coverage true
  // https://github.com/gotwarlost/istanbul#multiple-process-usage
  process.env.coffee_inject_istanbul = process.env.running_under_istanbul ? this._isCoverage : false;
  debug('coverage enable: %s', process.env.coffee_inject_istanbul);
  var cmd = this.proc = run(this.method, this.cmd, this.args, this.opt);

  cmd.stdout && cmd.stdout.on('data', this.emit.bind(this, 'stdout_data'));
  cmd.stderr && cmd.stderr.on('data', this.emit.bind(this, 'stderr_data'));
  cmd.once('error', this.emit.bind(this, 'error'));
  cmd.once('close', this.emit.bind(this, 'close'));

  if (this.stdin.length) {
    this.stdin.forEach(function(buf) {
      debug('input stdin `%s`', show(buf));
      cmd.stdin.write(buf);
    });
    cmd.stdin.end();
  }

  return this;
};

Coffee.prototype.restore = function() {
  // cache input for command
  this.stdin = [];

  // cache output for command
  this.stdout = '';
  this.stderr = '';
  this.code = null;
  this.error = null;

  // cache expected output
  this.waitAssert = {
    stderr: [],
    stdout: [],
    code: [],
    error: [],
  };
  this.complete = false;
  this._isEndCalled = false;
  this._debug_stdout = false;
  this._debug_stderr = false;
  this._isCoverage = true;
  return this;
};

function run(method, cmd, args, opt) {
  if (!opt && args && typeof args === 'object' && !Array.isArray(args)) {
    // run(method, cmd, opt)
    opt = args;
    args = null;
  }

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
