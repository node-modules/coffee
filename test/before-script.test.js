'use strict';

const assert = require('assert');
const path = require('path');
const coffee = require('..');

const fixtures = path.join(__dirname, 'fixtures/mock-os');
const mockScript = path.join(fixtures, 'mock.js');

describe('coffee.beforeScript()', () => {
  it('should add before hook script on shebang cli bin', () => {
    const cmd = path.join(fixtures, 'cli.js');
    return coffee.fork(cmd)
      .beforeScript(mockScript)
      .debug()
      .expect('stdout', /homedir = \/some\/home\/dir/)
      .expect('code', 0)
      .end();
  });

  it('beforeScript should not change process.execArgv', done => {
    const cmd = path.join(fixtures, 'cli.js');
    process.execArgv = [];
    coffee.fork(cmd)
      .beforeScript(mockScript)
      .debug()
      .expect('stdout', /homedir = \/some\/home\/dir/)
      .expect('code', 0)
      .end(() => {
        assert(process.execArgv.length === 0);
        done();
      });
  });

  it('should add before hook script on non-shebang cli script', () => {
    const cmd = path.join(fixtures, 'cli-no-shebang.js');
    return coffee.fork(cmd)
      .debug()
      .beforeScript(mockScript)
      .expect('stdout', /homedir = \/some\/home\/dir/)
      .expect('code', 0)
      .end();
  });

  it('should add before hook script with execArgv', () => {
    const cmd = path.join(fixtures, 'cli.js');
    return coffee.fork(cmd, [], { execArgv: [ '--inspect' ] })
      .beforeScript(mockScript)
      .debug()
      .expect('stdout', /homedir = \/some\/home\/dir/)
      .expect('code', 0)
      .end();
  });

  it('should throw error on spawn', () => {
    const cmd = path.join(fixtures, 'cli.js');
    assert.throws(() => {
      coffee.spawn(cmd)
        .beforeScript(mockScript);
    }, /can\'t set beforeScript on spawn process/);
  });

  it('should throw error on fork not absolute path cmd', () => {
    assert.throws(() => {
      coffee.fork('coffee')
        .beforeScript(mockScript);
    }, /can't set beforeScript, coffee must be absolute path/);
  });
});
