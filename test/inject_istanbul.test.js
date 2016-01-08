'use strict';

var path = require('path');
var mm = require('mm');
var coffee = require('../index');
var findIstanbul = require('../lib/find_istanbul');
var fixtures = path.join(__dirname, 'fixtures');

describe('coffee with istanbul', function() {

  afterEach(mm.restore);

  it('should generate coverage', function(done) {
    coffee.spawn('npm', ['test'], { cwd: path.join(__dirname, 'fixtures/istanbul') })
    .expect('stdout', / child.js {6}| {6}100 /)
    .expect('stdout', / grandchild.js | {6}100 /)
    .expect('stdout', / index.js {6}| {6}100 /)
    .end(done);
  });

  it('should not generate coverage', function(done) {
    coffee.spawn('npm', ['test'], { cwd: path.join(__dirname, 'fixtures/istanbul-no-coverage') })
    .end(function(err, res) {
      res.stdout.should.not.containEql('child.js');
      res.stdout.should.not.containEql('grandchild.js');
      res.stdout.should.not.containEql('index.js');
      done();
    });
  });

  it('should coffee_inject_istanbul = true', function(done) {
    mm(process.env, 'running_under_istanbul', 1);
    coffee.fork(path.join(fixtures, 'env.js'))
    .coverage(true)
    .expect('stdout', /coffee_inject_istanbul: 'true'/)
    .end(done);
  });

  it('should coffee_inject_istanbul = false when coverage(false)', function(done) {
    coffee.fork(path.join(fixtures, 'env.js'))
    .coverage(false)
    .expect('stdout', /coffee_inject_istanbul: 'false'/)
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

  it('should findIstanbul when process.env._ has istanbul', function() {
    mm(process.env, '_', '/home/admin/node_modules/.bin/istanbul');
    findIstanbul().should.equal('/home/admin/node_modules/.bin/istanbul');
  });

  it('should findIstanbul when process.env._ exists', function() {
    mm(process.env, 'HOME', '/tmp');
    mm(process.env, '_', path.join(__dirname, 'index.test.js'));
    findIstanbul().should.equal(path.join(__dirname, '../node_modules/.bin/istanbul'));
  });

  it('should findIstanbul when process.env._ is undefined', function() {
    mm(process.env, '_', '');
    findIstanbul().should.equal(path.join(__dirname, '../node_modules/.bin/istanbul'));
  });
});
