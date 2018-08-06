'use strict';

const path = require('path');
const coffee = require('../../../../index');

describe('istanbul', function() {
  it('should work', function(done) {
    coffee.fork(path.join(__dirname, '../index.js'))
      .coverage(process.env.DISABLE_COV !== true)
      .end(done);
  });
});
