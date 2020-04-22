'use strict';

let i = 0;

setInterval(() => {
  i++;
  if (i === 10) console.log('egg-ready');
  console.log('hi', i);
}, 100);
