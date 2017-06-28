'use strict';

const path = require('path');
const coffee = require('..');

const fixtures = path.join(__dirname, 'fixtures/mock-os');
const mockScript = path.join(fixtures, 'mock.js');

describe('coffee.beforeScript()', () => {
  it('should add before hook script on shebang cli bin', () => {
    const cmd = path.join(fixtures, 'cli.js');
    return coffee.fork(cmd)
      .beforeScript(mockScript)
      // .debug()
      .expect('stdout', /homedir = \/some\/home\/dir/)
      .expect('code', 0)
      .end();
  });

  it('should add before hook script on non-shebang cli script', () => {
    const cmd = path.join(fixtures, 'cli-no-shebang.js');
    return coffee.fork(cmd)
      // .debug()
      .beforeScript(mockScript)
      .expect('stdout', /homedir = \/some\/home\/dir/)
      .expect('code', 0)
      .end();
  });
});
