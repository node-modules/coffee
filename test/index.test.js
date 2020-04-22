'use strict';

const assert = require('assert');
const path = require('path');
const spy = require('spy');
const mm = require('mm');
const { mkdirp, rimraf } = require('mz-modules');
const coffee = require('..');
const show = require('../lib/show');
const Coffee = coffee.Coffee;

const fixtures = path.join(__dirname, 'fixtures');

describe('coffee', () => {

  afterEach(mm.restore);

  it('should pass cmd and method', () => {
    assert.throws(() => {
      new Coffee();
    }, /should specify method and cmd/);

    assert.throws(() => {
      new Coffee({
        cmd: 'echo',
      });
    }, /should specify method and cmd/);

    assert.throws(() => {
      new Coffee({
        method: 'spawn',
      });
    }, /should specify method and cmd/);

    assert.throws(() => {
      new Coffee({
        method: 'fork',
        cmd: path.join(fixtures, 'stdout-stderr.js'),
        opt: { cwd: __dirname + '/not-exists' },
      });
    }, /opt.cwd.*not exists/);
  });

  it('should not call write after call end', done => {
    const coffee = new Coffee({
      method: 'fork',
      cmd: path.join(fixtures, 'stdout-stderr.js'),
    });
    coffee.end(() => {
      try {
        coffee.write();
      } catch (e) {
        assert(e.message === 'can\'t call write after end');
        done();
      }
    });
  });

  it('should run without callback', done => {
    const c = new Coffee({
      method: 'fork',
      cmd: path.join(fixtures, 'stdout-stderr.js'),
    });
    c.end();
    setTimeout(() => {
      assert(c.complete);
      done();
    }, 1000);
  });

  it('should ignore specified expect key', done => {
    try {
      new Coffee({
        method: 'fork',
        cmd: path.join(fixtures, 'stdout-stderr.js'),
      })
        .expect('unacceptkey', '1')
        .notExpect('unacceptkey', '1')
        .end();
    } catch (err) {
      assert(err.message.includes('unknown rule type: unacceptkey'));
      return done();
    }
    done('should run exec here');
  });

  it('should set the callback of the latest end method', done => {
    const spy1 = spy();
    const spy2 = spy();
    const c = new Coffee({
      method: 'fork',
      cmd: path.join(fixtures, 'cwd.js'),
    });
    c.end(spy1);
    c.end(spy2);

    setTimeout(() => {
      assert(!spy1.called);
      assert(spy2.called);
      done();
    }, 1000);
  });

  it('should .debug(1)', done => {
    require('events').EventEmitter.defaultMaxListeners = 15;
    let stdout = '';
    let stderr = '';
    const stderrWrite = process.stderr.write;
    const stdoutWrite = process.stdout.write;
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
      cmd: path.join(fixtures, 'stdout-stderr.js'),
    })
      .debug(1)
      .end(() => {
        assert(stdout === 'write to stdout\n');
        assert(stderr === '');
        done();
      });
  });

  it('should .debug(2)', done => {
    let stdout = '';
    let stderr = '';
    const stderrWrite = process.stderr.write;
    const stdoutWrite = process.stdout.write;
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
      cmd: path.join(fixtures, 'stdout-stderr.js'),
    })
      .debug(2)
      .end(() => {
        assert(stdout === '');
        assert(stderr === 'stderr\n');
        done();
      });
  });

  it('should debug when COFFEE_DEBUG', done => {
    let stdout = '';
    let stderr = '';
    const stderrWrite = process.stderr.write;
    const stdoutWrite = process.stdout.write;
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
      cmd: path.join(fixtures, 'stdout-stderr.js'),
    })
      .end(() => {
        assert(stdout === 'write to stdout\n');
        assert(stderr === '');
        done();
      });
  });

  it('should .debug(false)', done => {
    let stdout = '';
    let stderr = '';
    const stderrWrite = process.stderr.write;
    const stdoutWrite = process.stdout.write;
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
      cmd: path.join(fixtures, 'stdout-stderr.js'),
    })
    // .debug()
      .debug(false)
      .end(() => {
        assert(stdout === '');
        assert(stderr === '');
        done();
      });
  });

  it('should support pass execArgv', () => {
    return coffee.fork(path.join(fixtures, 'stdout-stderr.js'), [], { execArgv: [ '--inspect' ] })
      .debug()
      .expect('stdout', /write to stdout/)
      .expect('stderr', /stderr/)
      .expect('stderr', /Debugger listening/)
      .expect('code', 0)
      .end();
  });

  describe('fork', () => {
    run('fork');

    it('should receive data from stdin', done => {
      coffee.fork(path.join(fixtures, 'stdin.js'))
        .write('1\n')
        .write('2')
        .expect('stdout', '1\n2')
        .expect('code', 0)
        .end(done);
    });

    it('should receive data from stdin with special key', done => {
      coffee.fork(path.join(fixtures, 'stdin.js'))
        .writeKey('1')
        .writeKey('ENTER')
        .writeKey('2', 'ENTER', '3')
        .expect('stdout', '1\n2\n3')
        .expect('code', 0)
        .end(done);
    });

    it('should write data when receive message', done => {
      coffee.fork(path.join(fixtures, 'prompt.js'))
        // .debug()
        .waitForPrompt()
        .write('tz\n')
        .writeKey('2', 'ENTER')
        .expect('stdout', 'What\'s your name? hi, tz\nHow many coffee do you want? here is your 2 coffee\n')
        .expect('code', 0)
        .end(done);
    });

    it('should fork with autoCoverage = true', done => {
      coffee.fork(path.join(fixtures, 'stdin.js'), null, {
        autoCoverage: true,
      })
        .write('1\n')
        .write('2')
        .expect('stdout', '1\n2')
        .expect('code', 0)
        .end(function(err) {
          assert(!err);
          assert(this.proc);
          done();
        });
    });

    it('should support fork(cmd, opt)', done => {
      coffee.fork(path.join(fixtures, 'stdin.js'), {
        autoCoverage: true,
      })
        .write('1\n')
        .write('2')
        .expect('stdout', '1\n2')
        .expect('code', 0)
        .end(function(err) {
          assert(!err);
          assert(this.proc);
          done();
        });
    });
  });

  describe('spawn', () => {
    run('spawn');

    it('should receive data from stdin', done => {
      coffee.spawn('cat')
      // .debug()
        .write('1\n')
        .write('2')
        .expect('stdout', '1\n2')
        .expect('code', 0)
        .end(done);
    });
  });

  describe('extendable', () => {
    const tmpDir = path.join(fixtures, '.tmp');
    const MyCoffee = require('./fixtures/extendable/my-coffee');

    beforeEach(() => {
      return rimraf(tmpDir).then(() => mkdirp(tmpDir));
    });

    after(() => rimraf(tmpDir));

    it('should work', done => {
      MyCoffee.fork(path.join(fixtures, 'stdout-stderr.js'))
        .expect('custom', path.join(fixtures, 'README.md'))
        .notExpect('custom', path.join(fixtures, 'not-exist'))
        .end(done);
    });

    it('should throw when not expect', done => {
      const file = path.join(fixtures, 'no-exist');
      MyCoffee.fork(path.join(fixtures, 'stdout-stderr.js'))
        .expect('custom', file)
        .end(err => {
          assert(!!err);
          console.log(err.message);
          assert(`should exists file ${file}` === err.message);
          done();
        });
    });

    it('should assert file', done => {
      MyCoffee.fork(path.join(fixtures, 'file.js'))
        .debug()
        .expect('file', `${tmpDir}/package.json`)
        .expect('file', `${tmpDir}/package.json`, { name: 'rule_file' })
        .expect('file', `${tmpDir}/package.json`, [{ name: 'rule_file' }, { version: '1.0.0' }])
        .expect('file', `${tmpDir}/README.md`, 'hello')
        .expect('file', `${tmpDir}/README.md`, /hello/)
        .expect('file', `${tmpDir}/README.md`, [ 'hello', /world/ ])
        .notExpect('file', `${tmpDir}/no-exist.json`)
        .notExpect('file', `${tmpDir}/README.md`, 'some')
        .notExpect('file', `${tmpDir}/README.md`, /some/)
        .notExpect('file', `${tmpDir}/README.md`, [ 'some', /some/ ])
        .end(done);
    });
  });

  it('should print well', () => {
    assert(show('coffee\negg') === 'coffee\\negg(String)');
    assert(show(Buffer.from('coffee\negg')) === 'coffee\\negg(Uint8Array)');
    assert(show(/coffee/) === '/coffee/(RegExp)');
    assert(show({ name: 'coffee' }) === '{"name":"coffee"}(Object)');
    assert(show([ 1, 2, 3 ]) === '[1,2,3](Array)');
    assert(show(1 === '1(Number)'));
  });

  it('should compile ts without error', () => {
    return coffee.fork(
      require.resolve('typescript/bin/tsc'),
      [ '-p', path.resolve(__dirname, './fixtures/ts/tsconfig.json') ]
    )
      .debug()
      .expect('code', 0)
      .end();
  });
});

function run(type) {

  it('should work', done => {
    call('stdout-stderr')
      .expect('stdout', 'write to stdout\n')
      .expect('stderr', 'stderr\n')
      .expect('code', 0)
      .end(done);
  });

  it('should work with debug', done => {
    call('stdout-stderr')
      .debug()
      .expect('stdout', 'write to stdout\n')
      .expect('stderr', 'stderr\n')
      .expect('code', 0)
      .end(done);
  });

  it('should work that assert in end', done => {
    call('stdout-stderr')
      .end(function(err, res) {
        assert(!err);
        assert(res.stdout.includes('write to stdout\n'));
        assert(res.stderr.includes('stderr\n'));
        assert(res.code === 0);
        done();
      });
  });

  it('should not match on different type', done => {
    call('stdout-stderr')
      .expect('code', '0')
      .end(function(err) {
        assert(err);
        assert(
          err.message === 'should match code expected `0(String)` but actual `0(Number)`'
        );
        done();
      });
  });

  describe('expect', () => {

    it('should match stdout, stderr, code', done => {
      call('stdout-stderr')
        .expect('stdout', 'write to stdout\n')
        .expect('stderr', 'stderr\n')
        .expect('code', 0)
        .end(done);
    });

    it('should not match on strict equal', done => {
      call('stdout-stderr')
        .expect('stdout', 'stdout')
        .end(function(err) {
          assert(err);
          assert(
            err.message === 'should match stdout expected `stdout(String)` but actual `write to stdout\\n(String)`'
          );
          done();
        });
    });

    it('should match with RegExp', done => {
      call('stdout-stderr')
        .expect('stdout', /stdout/)
        .expect('stdout', /write /)
        .expect('stderr', /stderr/)
        .expect('stderr', /err/)
        .end(done);
    });

    it('should not match with RegExp', done => {
      call('stdout-stderr')
        .expect('stdout', /write/)
        .expect('stdout', /nothing/)
        .end(function(err) {
          assert(err);
          assert(
            err.message === 'should match stdout expected `/nothing/(RegExp)` but actual `write to stdout\\n(String)`'
          );
          done();
        });
    });

    it('should match with Array', done => {
      call('stdout-stderr')
        .expect('stdout', [ /write/, /to/, /stdout/ ])
        .end(done);
    });

    it('should exit with code 1', done => {
      call('process-exit')
        .expect('stdout', 'exit 1')
        .expect('code', 1)
        .end(done);
    });
  });

  describe('notExpect', () => {

    it('should match stdout', done => {
      call('stdout-stderr')
        .notExpect('stdout', 'write to stdout\n')
        .end(function(err) {
          assert(
            err.message === 'should not match stdout expected `write to stdout\\n(String)` but actual `write to stdout\\n(String)`'
          );
          done();
        });
    });

    it('should not match stdout', done => {
      call('stdout-stderr')
        .notExpect('stdout', 'stdout')
        .end(done);
    });

    it('should not match with RegExp', done => {
      call('stdout-stderr')
        .notExpect('stdout', /nothing/)
        .end(done);
    });

    it('should not match with Array', done => {
      call('stdout-stderr')
        .notExpect('stdout', [ /nothing/ ])
        .end(done);
    });

    it('should exit with code 1', done => {
      call('process-exit')
        .notExpect('code', 0)
        .end(done);
    });

  });

  it('should assert error', done => {
    const cmd = path.join(fixtures, 'unknown.js');
    call('unknown.js')
      .debug()
      .expect('error', /ENOENT/)
      .expect('error', 'spawn ' + cmd + ' ENOENT')
      .expect('error', new Error('spawn ' + cmd + ' ENOENT'))
      .end(done);
  });

  it('should expect after end', done => {
    call('stdout-stderr')
      .end(function() {
        this.expect('stdout', 'write to stdout\n');
        this.notExpect('stdout', 'write to stderr\n');
        this.expect('stderr', 'stderr\n');
        this.notExpect('stderr', 'stdout\n');
        done();
      });
  });

  it('should not expect after end', done => {
    call('stdout-stderr')
      .end(function() {
        let err;
        try {
          this.expect('stdout', 'write to stderr');
        } catch (e) {
          err = e;
        }
        assert(
          err.message === 'should match stdout expected `write to stderr(String)` but actual `write to stdout\\n(String)`'
        );
        done();
      });
  });

  it.only('should support promise', done => {
    call('stdout-stderr')
      .expect('stdout', 'write to stdout\n')
      .expect('stderr', 'stderr\n')
      .expect('code', 0)
      .end()
      .then(result => {
        assert(result.proc);
        done();
      })
      .catch(done);
  });

  it.only('should support promise when error', done => {
    call('stdout-stderr')
      .expect('stdout', 'write to stdout\n')
      .expect('stderr', 'stderr\n')
      .expect('code', 1)
      .end()
      .catch(function(err) {
        assert(err);
        assert(err.proc);
        done();
      });
  });

  it('should return this when call coverage', () => {
    const c = coffee.spawn('cat');
    assert(c.coverage() === c);
  });

  it('should assert opt.cwd', function* () {
    try {
      yield call('stdout-stderr', [], { cwd: __dirname + '/not-exists' })
        .debug()
        .expect('error', /ENOENT/)
        .end();
      throw new Error('should not run here');
    } catch (err) {
      assert(err.message.match(/opt.cwd.*not exist/));
    }
  });

  function call(filepath, ...args) {
    if (!path.extname(filepath)) {
      let ext = type === 'fork' ? '.js' : '.sh';
      if (process.platform === 'win32') ext = '.js';
      filepath += ext;
    }
    return coffee[type](path.join(fixtures, filepath), ...args);
  }
}
