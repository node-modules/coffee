'use strict';

const path = require('path');
const coffee = require('..');

describe('coffee with nyc', () => {

  it('should show coverage', function(done) {
    const cwd = path.join(__dirname, 'fixtures/nyc');
    coffee.spawn('npm', [ 'run', 'cov' ], { cwd })
      .debug()
      .expect('code', 0)
      .expect('stdout', / child.js {6}| {6}100 /)
      .expect('stdout', / grandchild.js | {6}100 /)
      .expect('stdout', / index.js {6}| {6}100 /)
      .end(done);
  });

  it.skip('should disable coverage', () => {});
});
