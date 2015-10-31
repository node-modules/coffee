'use strict';

var path = require('path');
var mm = require('mm');
var coffee = require('../index');
var fixtures = path.join(__dirname, 'fixtures');

describe('coffee with istanbul', function() {

  afterEach(mm.restore);

  it('should pass', function(done) {
    coffee.spawn('npm', ['test'], { cwd: path.join(__dirname, 'fixtures/istanbul') })
    .expect('stdout', / child.js {6}| {6}100 /)
    .expect('stdout', / grandchild.js | {6}100 /)
    .expect('stdout', / index.js {6}| {6}100 /)
    .end(done);
  });

  it('should work when pass none args', function(done) {
    coffee.fork(path.join(fixtures, 'argv.js'), [])
    .expect('stdout', '\n')
    .end(done);
  });

  it('should work when istanbul_bin_path is empty', function(done) {
    mm(process.env, 'istanbul_bin_path', '');
    coffee.fork(path.join(fixtures, 'argv.js'), ['-a', '1', '-b', 2])
    .expect('stdout', '-a 1 -b 2\n')
    .end(done);
  });

  it('should work when pass args', function(done) {
    coffee.fork(path.join(fixtures, 'argv.js'), ['-a', '1', '-b', 2])
    .expect('stdout', '-a 1 -b 2\n')
    .end(done);
  });

  it('should set cwd', function(done) {
    coffee.fork(path.join(fixtures, 'cwd.js'), [], { cwd: path.join(__dirname, 'fixtures/istanbul') })
    .expect('stdout', /test\/fixtures\/istanbul/)
    .end(done);
  });

});
