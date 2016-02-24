'use strict';

var should = require('should');
var path = require('path');
var spy = require('spy');
var mm = require('mm');
var coffee = require('..');
var Coffee = coffee.Coffee;

var fixtures = path.join(__dirname, 'fixtures');

describe('coffee', function() {

  afterEach(mm.restore);

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

  it('should not call write after call end', function(done) {
    const coffee = new Coffee({
      method: 'fork',
      cmd: path.join(fixtures, 'stdout-stderr.js')
    })
    .end(function() {
      try {
        coffee.write();
      } catch(e) {
        e.message.should.eql('can\'t call write after end');
        done();
      }
    });
  });

  it('should not call expect after call end', function(done) {
    const coffee = new Coffee({
      method: 'fork',
      cmd: path.join(fixtures, 'stdout-stderr.js')
    })
    .end(function() {
      try {
        coffee.expect();
      } catch(e) {
        e.message.should.eql('can\'t call expect after end');
        done();
      }
    });
  });

  it('should run without callback', function(done) {
    var c = new Coffee({
      method: 'fork',
      cmd: path.join(fixtures, 'stdout-stderr.js')
    })
    .end();
    setTimeout(function() {
      c.complete.should.be.true;
      done();
    }, 8000);
  });

  it('should ignore specified expect key', function(done) {
    new Coffee({
      method: 'fork',
      cmd: path.join(fixtures, 'stdout-stderr.js')
    })
    .expect('unacceptkey', '1')
    .notExpect('unacceptkey', '1')
    .end(done);
  });

  it('should set the callback of the latest end method', function(done) {
    var spy1 = spy();
    var spy2 = spy();
    new Coffee({
      method: 'fork',
      cmd: path.join(fixtures, 'cwd.js')
    })
    .end(spy1)
    .end(spy2);

    setTimeout(function() {
      spy1.called.should.be.false;
      spy2.called.should.be.true;
      done();
    }, 3000);
  });

  it('should .debug(1)', function(done) {
    var stdout = '', stderr = '';
    var stderrWrite = process.stderr.write;
    var stdoutWrite = process.stdout.write;
    mm(process.stderr, 'write', function(buf) {
      stderr += buf;
      stderrWrite.call(process.stderr, buf);
    });
    mm(process.stdout, 'write', function(buf) {
      stdout += buf;
      stdoutWrite.call(process.stdout, buf);
    });
    new Coffee({
      method: 'fork',
      cmd: path.join(fixtures, 'stdout-stderr.js')
    })
    .debug(1)
    .end(function() {
      stdout.should.eql('write to stdout\n');
      stderr.should.eql('');
      done();
    });
  });

  it('should .debug(2)', function(done) {
    var stdout = '', stderr = '';
    var stderrWrite = process.stderr.write;
    var stdoutWrite = process.stdout.write;
    mm(process.stderr, 'write', function(buf) {
      stderr += buf;
      stderrWrite.call(process.stderr, buf);
    });
    mm(process.stdout, 'write', function(buf) {
      stdout += buf;
      stdoutWrite.call(process.stdout, buf);
    });
    new Coffee({
      method: 'fork',
      cmd: path.join(fixtures, 'stdout-stderr.js')
    })
    .debug(2)
    .end(function() {
      stdout.should.eql('');
      stderr.should.eql('stderr\n');
      done();
    });
  });

  it('should debug when COFFEE_DEBUG', function(done) {
    var stdout = '', stderr = '';
    var stderrWrite = process.stderr.write;
    var stdoutWrite = process.stdout.write;
    mm(process.stderr, 'write', function(buf) {
      stderr += buf;
      stderrWrite.call(process.stderr, buf);
    });
    mm(process.stdout, 'write', function(buf) {
      stdout += buf;
      stdoutWrite.call(process.stdout, buf);
    });
    mm(process.env, 'COFFEE_DEBUG', 1);
    new Coffee({
      method: 'fork',
      cmd: path.join(fixtures, 'stdout-stderr.js')
    })
    .end(function() {
      stdout.should.eql('write to stdout\n');
      stderr.should.eql('');
      done();
    });
  });

  describe('fork', function() {
    run('fork');

    it('should receive data from stdin', function(done) {
      coffee.fork(path.join(fixtures, 'stdin.js'))
      .write('1\n')
      .write('2')
      .expect('stdout', '1\n2')
      .expect('code', 0)
      .end(done);
    });

    it('should fork with autoCoverage = true', function(done) {
      coffee.fork(path.join(fixtures, 'stdin.js'), null, {
        autoCoverage: true,
      })
      .write('1\n')
      .write('2')
      .expect('stdout', '1\n2')
      .expect('code', 0)
      .end(function(err) {
        should.not.exists(err);
        should.exists(this.proc);
        done();
      });
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

  it('should work', function(done) {
    call('stdout-stderr')
    .expect('stdout', 'write to stdout\n')
    .expect('stderr', 'stderr\n')
    .expect('code', 0)
    .end(done);
  });

  it('should work with debug', function(done) {
    call('stdout-stderr')
    .debug()
    .expect('stdout', 'write to stdout\n')
    .expect('stderr', 'stderr\n')
    .expect('code', 0)
    .end(done);
  });

  it('should work that assert in end', function(done) {
    call('stdout-stderr')
    .end(function(err, res) {
      should.not.exists(err);
      res.stdout.should.containEql('write to stdout\n');
      res.stderr.should.containEql('stderr\n');
      res.code.should.equal(0);
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

  describe('expect', function() {

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
      .expect('stdout', [/write/, /to/, /stdout/])
      .end(done);
    });

    it('should exit with code 1', function(done) {
      call('process-exit')
      .expect('stdout', 'exit 1')
      .expect('code', 1)
      .end(done);
    });

  });

  describe('notExpect', function() {

    it('should match stdout', function(done) {
      call('stdout-stderr')
      .notExpect('stdout', 'write to stdout\n')
      .end(function(err) {
        err.message.should.eql('should not match stdout expected `write to stdout\\n(String)` but actual `write to stdout\\n(String)`');
        done();
      });
    });

    it('should not match stdout', function(done) {
      call('stdout-stderr')
      .notExpect('stdout', 'stdout')
      .end(done);
    });

    it('should not match with RegExp', function(done) {
      call('stdout-stderr')
      .notExpect('stdout', /nothing/)
      .end(done);
    });

    it('should not match with Array', function(done) {
      call('stdout-stderr')
      .notExpect('stdout', [/nothing/])
      .end(done);
    });

    it('should exit with code 1', function(done) {
      call('process-exit')
      .notExpect('code', 0)
      .end(done);
    });

  });

  it('should assert error', function(done) {
    var cmd = path.join(fixtures, 'unknown.sh');
    call('unknown')
    .debug()
    .expect('error', /ENOENT/)
    .expect('error', 'spawn ' + cmd + ' ENOENT')
    .expect('error', new Error('spawn ' + cmd + ' ENOENT'))
    .end(done);
  });

  it.skip('should receive arguments', function() {

  });

  function call(filepath) {
    filepath += type === 'fork' ? '.js' : '.sh';
    return coffee[type](path.join(fixtures, filepath));
  }
}
