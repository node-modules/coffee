# Coffee

[![NPM version](https://img.shields.io/npm/v/coffee.svg?style=flat)](https://npmjs.org/package/coffee)
[![Build Status](https://img.shields.io/travis/popomore/coffee.svg?style=flat)](https://travis-ci.org/popomore/coffee)
[![Build Status](https://img.shields.io/coveralls/popomore/coffee?style=flat)](https://coveralls.io/r/popomore/coffee)
[![NPM downloads](http://img.shields.io/npm/dm/coffee.svg?style=flat)](https://npmjs.org/package/coffee)

Test command line on nodejs

---

```
## Install

$ npm install coffee -g
```

## Usage

Coffee is useful to test command line in Mocha or other test frammework.

```
describe('cat', function() {
  it('should concat input', function(done) {
    var coffee = require('coffee');
    coffe.spawn('cat')
    .write('1')
    .write('2')
    .expect('stdout', '12')
    .expect('code', 0)
    .end(done);
  })
})
```

You can also use fork for spawning Node processes.

```
coffe.fork('/path/to/file.js', ['args '])
.expect('stdout', '12\n')
.expect('stderr', '34\n')
.expect('code', 0)
.end(done);
```

In file.js

```
console.log(12);
console.log(34);
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

```
coffe.spawn('echo', ['abcdefg'])
.expect('stdout', 'abcdefg')
.expect('stdout', /^abc/)
.expect('stdout', ['abcdefg', /abc/])
.end(done);
```

Accept type: `stdout`, `stderr`, `code`

#### coffee.write(data)

Write data to stdin, see example above.

#### coffee.end(callback)

Callback will be called after completing the assertion, the first argument is Error if throw exception. 

## LISENCE

Copyright (c) 2015 popomore. Licensed under the MIT license.
