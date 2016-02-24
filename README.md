# Coffee

Test command line on Node.js.

---

[![NPM version](https://img.shields.io/npm/v/coffee.svg?style=flat)](https://npmjs.org/package/coffee)
[![Build Status](https://img.shields.io/travis/popomore/coffee.svg?style=flat)](https://travis-ci.org/popomore/coffee)
[![codecov.io](https://img.shields.io/codecov/c/github/popomore/coffee.svg?style=flat)](http://codecov.io/github/popomore/coffee?branch=master)
[![NPM downloads](http://img.shields.io/npm/dm/coffee.svg?style=flat)](https://npmjs.org/package/coffee)

## Install

```
$ npm install coffee -g
```

## Usage

Coffee is useful for test command line in test frammework (like Mocha).

```js
describe('cat', function() {
  it('should concat input', function(done) {
    var coffee = require('coffee');
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
coffee.fork('/path/to/file.js', ['args '])
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

## Support multiple process coverage with istanbul

Coffee will detect `istanbul` automatically, and generate coverage-{processId}.json, you should generate reporter by `istanbul report`.

```bash
$ rm -rf coverage
$ istanbul cover --report none --print none node_modules/mocha/bin/_mocha -- -R spec -t 5000
$ istanbul report text-summary json lcov
=============================== Coverage summary ===============================
State## ments   : 98.2% ( 109/111 )
Branches     : 97.37% ( 37/38 )
Functions    : 100% ( 20/20 )
Lines        : 98.18% ( 108/110 )
================================================================================
```

## API

### coffee.spawn

Run command using `child_process.spawn`, then return `Coffee` instance.

Arguments see [child_process.spawn](http://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options)

### coffee.fork

Run command using `child_process.fork`, then return `Coffee` instance.

Arguments see [child_process.fork](http://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options)

### Coffee

Assertion object

#### coffee.expect(type, expected)

Assert type with expected value, expected value can be string, regular expression, and array.

```js
coffee.spawn('echo', ['abcdefg'])
.expect('stdout', 'abcdefg')
.expect('stdout', /^abc/)
.expect('stdout', ['abcdefg', /abc/])
.end(done);
```

Accept type: `stdout`, `stderr`, `code`, `error`

#### coffee.notExpect(type, expected)

The opposite assertion of `expect`.

#### coffee.write(data)

Write data to stdin, see example above.

#### coffee.end(callback)

Callback will be called after completing the assertion, the first argument is Error if throw exception.

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

## LISENCE

Copyright (c) 2015 popomore. Licensed under the MIT license.


[istanbul]: https://github.com/gotwarlost/istanbul
