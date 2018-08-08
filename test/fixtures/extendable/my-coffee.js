'use strict';

const Coffee = require('../../..').Coffee;
const FileRule = require('./rule_file');

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


module.exports = MyCoffee;
