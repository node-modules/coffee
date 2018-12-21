'use strict';

const assert = require('assert');
const fs = require('fs');
const is = require('is-type-of');
const isMatch = require('lodash.ismatch');
const Rule = require('../../..').Rule;

class FileRule extends Rule {
  constructor(opts) {
    super(opts);
    const { args } = opts;
    // rewrite the expected
    this.expected = [{
      file: args[0],
      pattern: args[1],
    }];
  }

  // expect('file', `${tmpdir}/package.json`)
  // expect('file', `${tmpdir}/package.json`, { name: 'example' })
  // expect('file', `${tmpdir}/README`, /x = y/)
  // expect('file', `${tmpdir}/README`, [ 'abc', /\d+/ ])
  assert(actual, expected, message) {
    const { file, pattern } = expected;
    const isOpposite = this.isOpposite;
    const prefix = `file \`${file}\` should${isOpposite ? ' not' : ''}`;

    // only check file exists if `pattern` is not provided
    if (pattern === undefined) {
      message = `${prefix} exists `;
      return assert(fs.existsSync(file) !== isOpposite, message);
    }

    // whether file is exists before check pattern
    // `notExpect('file', 'path/to/README', /name/)` is treat as require file exists
    assert(fs.existsSync(file), `file \`${file}\` should exists before check ${isOpposite ? 'opposite ' : ''}rule \`${this.inspectObj(pattern)}\``);

    // read file content with cache
    let content = actual[file];
    if (!content) {
      content = actual[file] = fs.readFileSync(file, 'utf-8');
    }

    // check pattern list
    for (const p of [].concat(pattern)) {
      if (is.string(p)) {
        // if pattern is `string`, then test `includes`
        message = `${prefix} includes \`${this.inspectObj(p)}\` with content \`${this.inspectObj(content)}\``;
        assert(content.includes(p) !== isOpposite, message);
      } else if (is.regexp(p)) {
        message = `${prefix} match rule \`${this.inspectObj(p)}\` with content \`${this.inspectObj(content)}\``;
        assert(p.test(content) !== isOpposite, message);
      } else {
        // if pattern is `json`, then convert content to json and check whether contains pattern
        content = is.string(content) ? JSON.parse(content) : content;
        message = `${prefix} contains \`${this.inspectObj(p)}\` with content \`${this.inspectObj(content)}\``;
        assert(isMatch(content, p) !== isOpposite, message);
      }
    }
  }

  formatMessage(actual, expected, message) {
    return message;
  }
}

module.exports = FileRule;
