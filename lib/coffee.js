'use strict';

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const cp = require('child_process');
const assert = require('assert');
const debug = require('debug')('coffee');
const spawn = require('cross-spawn');
const assertion = require('./assert');
const show = require('./show');
const Rule = require('./rule');

// Only accept these type below for assertion
const acceptType = [ 'stdout', 'stderr', 'code', 'error' ];

class Coffee extends EventEmitter {

  constructor(opt) {
    opt || (opt = {});
    assert(opt.method && opt.cmd, 'should specify method and cmd');
    super();

    this.method = opt.method;
    this.cmd = opt.cmd;
    this.args = opt.args;
    this.opt = opt.opt;
    this.restore();

    this.on('stdout_data', buf => {
      debug('output stdout `%s`', show(buf));
      this._debug_stdout && process.stdout.write(buf);
      this.stdout += buf;
    });
    this.on('stderr_data', buf => {
      debug('output stderr `%s`', show(buf));
      this._debug_stderr && process.stderr.write(buf);
      this.stderr += buf;
    });
    this.on('error', err => {
      this.error = err;
    });
    this.once('close', code => {
      this._unpatchHookScripts();
      debug('output code `%s`', show(code));
      this.code = code;
      try {
        assertion(this.waitAssert.stdout, this.stdout, 'match stdout');
        assertion(this.waitAssert.stderr, this.stderr, 'match stderr');
        assertion(this.waitAssert.code, this.code, 'match code');
        this.error && assertion(this.waitAssert.error, this.error.message, 'match error message');
      } catch (err) {
        return done(err);
      }
      done();
    });
    const self = this;
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

  coverage() {
    // it has not been impelmented
    // if (enable === false) {
    //   process.env.NYC_NO_INSTRUMENT = true;
    // }
    return this;
  }

  beforeScript(scriptFile) {
    assert(this.method === 'fork', `can't set beforeScript on ${this.method} process`);
    assert(path.isAbsolute(this.cmd), `can't set beforeScript, ${this.cmd} must be absolute path`);
    this._beforeScriptFile = scriptFile;

    return this;
  }

  debug(level) {
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
  }

  expect(type, value) {
    if (acceptType.indexOf(type) > -1) {
      const rule = new Rule(value);
      if (this.complete) {
        assertion([ rule ], this[type], 'match ' + type);
      } else {
        this.waitAssert[type].push(rule);
      }
    }
    return this;
  }

  notExpect(type, value) {
    if (acceptType.indexOf(type) > -1) {
      const rule = new Rule(value, true);
      if (this.complete) {
        assertion([ rule ], this[type], 'match ' + type);
      } else {
        this.waitAssert[type].push(rule);
      }
    }
    return this;
  }

  /*
    Write data to stdin of the command
  */
  write(value) {
    assert(!this._isEndCalled, 'can\'t call write after end');
    this.stdin.push(value);
    return this;
  }

  end(cb) {
    this.cb = cb;
    if (!cb) {
      return new Promise((resolve, reject) => {
        this.on('complete_success', resolve);
        this.on('complete_error', reject);
      });
    }
  }

  get _hookScripts() {
    if (this._beforeScriptFile) {
      return `\n\nrequire(${JSON.stringify(this._beforeScriptFile)}); // !!!!!!!coffee hook script, don't change it!!!!!!!!\n\n`;
    }
  }

  _patchHookScripts() {
    const hookScriptsContent = this._hookScripts;
    if (!hookScriptsContent) return;
    let content = fs.readFileSync(this.cmd, 'utf8');
    if (!content.includes(hookScriptsContent)) {
      // skip shebang
      if (content.startsWith('#!')) {
        content = content.replace('\n', `\n${hookScriptsContent}`);
      } else {
        content = hookScriptsContent + content;
      }
      debug('add hook scripts %j into %s', hookScriptsContent, this.cmd);
      fs.writeFileSync(this.cmd, content);
    }
  }

  _unpatchHookScripts() {
    const hookScriptsContent = this._hookScripts;
    if (!hookScriptsContent) return;
    let content = fs.readFileSync(this.cmd, 'utf8');
    if (content.includes(hookScriptsContent)) {
      content = content.replace(hookScriptsContent, '');
      debug('remove hook scripts %j from %s', hookScriptsContent, this.cmd);
      fs.writeFileSync(this.cmd, content);
    }
  }

  _run() {
    this._isEndCalled = true;
    this._patchHookScripts();
    const cmd = this.proc = run(this.method, this.cmd, this.args, this.opt);

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
  }

  restore() {
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
  }
}

module.exports = Coffee;

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
  let handler = cp[method];
  if (process.platform === 'win32' && method === 'spawn') handler = spawn;
  return handler(cmd, args, opt);
}
