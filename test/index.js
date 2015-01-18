'use strict';

var should = require('should');
var path = require('path');
var coffee = require('..');
var Coffee = coffee.Coffee;

describe('coffee', function() {

  it('should pass cmd and method', function() {
    (function() {
      new Coffee();
    }).should.throw('should specify method and cmd');
    (function() {
      new Coffee({
        cmd: 'echo'
      });
    }).should.throw('should specify method and cmd');
    (function() {
      new Coffee({
        method: 'spawn'
      });
    }).should.throw('should specify method and cmd');
  });

  it('should not call write after call end', function() {
    (function() {
      new Coffee({
        method: 'fork',
        cmd: path.join(__dirname, 'fixtures/stdout-stderr.js')
      })
      .end()
      .write();
    }).should.throw('can\'t call write after end');
  });

  it('should not call expect after call end', function() {
    (function() {
      new Coffee({
        method: 'fork',
        cmd: path.join(__dirname, 'fixtures/stdout-stderr.js')
      })
      .end()
      .expect();
    }).should.throw('can\'t call expect after end');
  });

  it('should run without callback', function(done) {
    var c = new Coffee({
      method: 'fork',
      cmd: path.join(__dirname, 'fixtures/stdout-stderr.js')
    })
    .end();
    setTimeout(function() {
      c.complete.should.be.true;
      done();
    }, 2000);
  });

  it('should ignore specified expect key', function(done) {
    new Coffee({
      method: 'fork',
      cmd: path.join(__dirname, 'fixtures/stdout-stderr.js')
    })
    .expect('unacceptkey', '1')
    .end(done);
  });




  describe('fork', function() {
    run('fork');

    it('should receive data from stdin', function(done) {
      coffee.fork(path.join(__dirname, 'fixtures/stdin.js'))
      .write('1\n')
      .write('2')
      .expect('stdout', '1\n2')
      .expect('code', 0)
      .end(done);
    });
  });

  describe('spawn', function() {
    run('spawn');

    it('should receive data from stdin', function(done) {
      coffee.spawn('cat')
      .write('1\n')
      .write('2')
      .expect('stdout', '1\n2')
      .expect('code', 0)
      .end(done);
    });
  });
});

function run(type) {

  it('should work with coffee.fork', function(done) {
    call('stdout-stderr')
    .expect('stdout', 'write to stdout\n')
    .expect('stderr', 'stderr\n')
    .expect('code', 0)
    .end(done);
  });

  it('should match stdout, stderr, code', function(done) {
    call('stdout-stderr')
    .expect('stdout', 'write to stdout\n')
    .expect('stderr', 'stderr\n')
    .expect('code', 0)
    .end(done);
  });

  it('should not match on strict equal', function(done) {
    call('stdout-stderr')
    .expect('stdout', 'stdout')
    .end(function(err) {
      should.exists(err);
      err.message.should.eql('should match stdout expected `stdout(String)` but actual `write to stdout\\n(String)`');
      done();
    });
  });

  it('should not match on different type', function(done) {
    call('stdout-stderr')
    .expect('code', '0')
    .end(function(err) {
      should.exists(err);
      err.message.should.eql('should match code expected `0(String)` but actual `0(Number)`');
      done();
    });
  });

  it('should match with RegExp', function(done) {
    call('stdout-stderr')
    .expect('stdout', /stdout/)
    .expect('stdout', /write /)
    .expect('stderr', /stderr/)
    .expect('stderr', /err/)
    .end(done);
  });

  it('should not match with RegExp', function(done) {
    call('stdout-stderr')
    .expect('stdout', /write/)
    .expect('stdout', /nothing/)
    .end(function(err) {
      should.exists(err);
      err.message.should.eql('should match stdout expected `/nothing/(RegExp)` but actual `write to stdout\\n(String)`');
      done();
    });
  });

  it('should match with Array', function(done) {
    call('stdout-stderr')
    .expect('stdout', [/write/, /to/ ,/stdout/])
    .end(done);
  });

  it('should exit with code 1', function(done) {
    call('process-exit')
    .expect('stdout', 'exit 1')
    .expect('code', 1)
    .end(done);
  });

  it.skip('should receive arguments', function() {

  });

  function call(filepath) {
    filepath += type === 'fork' ? '.js' : '.sh';
    return coffee[type](path.join(__dirname, 'fixtures/' + filepath));
  }
}
