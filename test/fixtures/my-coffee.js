'use strict';

const coffee = require('..');
const Coffee = coffee.Coffee;
const fs = require('fs');
const path = require('path');

module.exports = class MyCoffee extends Coffee {
  checkAssertion() {
    super.checkAssertion();

  }

  expectFile(file, value) {
    if (this.complete) {
      assertion([rule], this[type], 'match ' + type);
    } else {
      this.waitAssert.file.push(rule);
    }
  }

  assertFile()

  restore() {
    super.restore();
    this.waitAssert.file = [];
    return this;
  }
};
