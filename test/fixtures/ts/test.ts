import { Coffee, Rule, fork, spawn } from '../../..';

const rule = new Rule({
  ctx: process.env,
  type: 'code',
  expected: 0,
  args: ['--flag']
});

rule.assert('123', '123');
rule.formatMessage('123', '123');
rule.validate('error');
rule.validate();

class MyRule extends Rule {}

new Coffee({
  method: 'fork',
  cmd: './test.js'
})
  .debug(false)
  .expect('code', 0)
  .notExpect('code', 1)
  .end((e, result) => {
    if (e) {
      console.error(e);
      return;
    }

    console.info(result);
  });

new Coffee({
  method: 'fork',
  cmd: './test.js'
})
  .debug()
  .write('echo 123')
  .writeKey('2', 'ENTER', '3')
  .waitForPrompt()
  .end()
  .then(result => {
    console.info(result);
  })
  .catch(e => {
    console.error(e);
  });

new Coffee({
  method: 'exec',
  cmd: './test.ts'
})
  .setRule('myRule', MyRule);

fork('./test.ts', [ '--flag' ]).expect('code', 1);
fork('./test.ts').expect('code', 1);
fork('./test.ts', [ '--flag' ], { cwd: process.cwd() }).expect('code', 1);
spawn('./test.ts', [ '--flag' ]).expect('code', 1);
spawn('./test.ts').expect('code', 1);
spawn('./test.ts', [ '--flag' ], { cwd: process.cwd() }).expect('code', 1);