# Coffee

Test command line on Node.js.

---

[![NPM version](https://img.shields.io/npm/v/coffee.svg?style=flat)](https://npmjs.org/package/coffee)
[![Build Status](https://img.shields.io/travis/node-modules/coffee.svg?style=flat)](https://travis-ci.org/node-modules/coffee)
[![codecov.io](https://img.shields.io/codecov/c/github/node-modules/coffee.svg?style=flat)](http://codecov.io/github/node-modules/coffee?branch=master)
[![NPM downloads](http://img.shields.io/npm/dm/coffee.svg?style=flat)](https://npmjs.org/package/coffee)

## Install

```bash
$ npm i coffee --save-dev
```

## Usage

Coffee is useful for test command line in test frammework (like Mocha).

```js
describe('cat', function() {
  it('should concat input', function(done) {
    const coffee = require('coffee');
    coffee.spawn('cat')
      .write('1')
      .write('2')
      .expect('stdout', '12')
      .expect('code', 0)
      .end(done);
  })
})
```

You can also use fork for spawning Node processes.

```js
coffee.fork('/path/to/file.js', [ 'args' ])
  .expect('stdout', '12\n')
  .expect('stderr', '34\n')
  .expect('code', 0)
  .end(done);
```

In file.js

```js
console.log(12);
console.error(34);
```

## Support multiple process coverage with nyc

Recommend to use [nyc] for coverage, you can use [any test frammework supported by nyc](https://istanbul.js.org/docs/tutorials/).

## API

### coffee.spawn

Run command using `child_process.spawn`, then return `Coffee` instance.

Arguments see [child_process.spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)

### coffee.fork

Run command using `child_process.fork`, then return `Coffee` instance.

Arguments see [child_process.fork](http://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options)

### coffee.Coffee

Assertion object

#### coffee.expect(type, expected)

Assert type with expected value, expected value can be string, regular expression, and array.

```js
coffee.spawn('echo', [ 'abcdefg' ])
  .expect('stdout', 'abcdefg')
  .expect('stdout', /^abc/)
  .expect('stdout', [ 'abcdefg', /abc/ ])
  .end(done);
```

Accept type: `stdout`, `stderr`, `code`, `error`

#### coffee.notExpect(type, expected)

The opposite assertion of `expect`.

#### coffee.write(data)

Write data to stdin, see example above.

#### coffee.waitForPrompt(bool)

If you set false, coffee will write stdin immediately, otherwise will wait for `prompt` message.

```js
coffee.fork('/path/to/cli', [ 'abcdefg' ])
  .waitForPrompt()
  .write('tz\n')
  .write('2\n');
  .end(done);
```

cli process should emit `prompt` message:

```js
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(q, callback) {
  process.send({ type: 'prompt' });
  rl.question(q, callback);
}

ask('What\'s your name? ', answer => {
  console.log(`hi, ${answer}`);
  ask('How many coffee do you want? ', answer => {
    console.log(`here is your ${answer} coffee`);
    rl.close();
  });
});
```

#### coffee.end(callback)

Callback will be called after completing the assertion, the first argument is Error if throw exception.

```js
coffee.fork('path/to/cli')
  .expect('stdout', 'abcdefg')
  .end(done);

// recommended to left undefind and use promise.
const { stdout, stderr, code } = await coffee.fork('path/to/cli').end();
assert(stdout.includes(abcdefg));
```

#### coffee.debug(level)

Write data to process.stdout and process.stderr for debug

`level` can be

- 0 (default): pipe stdout + stderr
- 1: pipe stdout
- 2: pipe stderr
- false: disable

Alternative you can use `COFFEE_DEBUG` env.

#### coffee.coverage()

If you set false, coffee will not generate coverage.json, default: true.

#### coffee.beforeScript(scriptFile)

Add a hook script before fork child process run.

### coffee.Rule

Assertion Rule

you could add your custom rule, see `test/fixtures/extendable` for more details.

```js
const { Coffee, Rule } = require('coffee');

class FileRule extends Rule {
  assert(actual, expected, message) {
    // do sth
    return super.assert(fs.existsSync(expected), true, `should exists file ${expected}`);
  }
}

class MyCoffee extends Coffee {
  constructor(...args) {
    super(...args);
    this.setRule('file', FileRule);
  }

  expectFile(expected) {
    this._addAssertion({
      type: 'file',
      expected,
    });
    return this;
  }
}

// Usage
.expectFile('README.md');
```

## LISENCE

Copyright (c) 2017 node-modules. Licensed under the MIT license.

[nyc]: https://github.com/istanbuljs/nyc
