#!/usr/bin/env node

'use strict';

const { prompt } = require('enquirer');
const { ReadStream } = require('tty');

prompt.on('prompt', prompt => {
  // console.log(prompt);
  process.send && process.send({ type: 'prompt' });
});

async function run() {
  const stdin = new ReadStream(process.stdin.fd);
  process.stdin.pipe(stdin);
  const answers = await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is your name?',
      stdin,
    },
    {
      type: 'select',
      name: 'color',
      message: 'Pick a flavor',
      choices: [ 'apple', 'grape', 'watermelon', 'cherry', 'orange' ],
      stdin,
    },
  ]);
  console.log(answers);
  stdin.end();
  process.stdin.end();
}

run().catch(console.error);
