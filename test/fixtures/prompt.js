#!/usr/bin/env node

'use strict';

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

ask('What\'s your name? ', answer => {
  console.log(`hi, ${answer}`);
  ask('How many coffee do you want? ', answer => {
    console.log(`here is your ${answer} coffee`);
    rl.close();
    process.exit();
  });
});

function ask(q, callback) {
  process.send({ type: 'prompt' });
  rl.question(q, callback);
}