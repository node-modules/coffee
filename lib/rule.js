'use strict';

function Rule(val, isOpposite) {
  if (Array.isArray(val)) {
    this.value = val.map(function(item) {
      return new Rule(item, isOpposite);
    });
  } else {
    this.value = val;
  }
  this.isOpposite = isOpposite === true;
}

module.exports = Rule;
