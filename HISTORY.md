
3.3.2 / 2017-05-22
==================

  * deps: upgrade dependencies (#56)
  * test: use assert instead of should (#54)

3.3.1 / 2017-05-10
==================

  * fix: should support fork(cmd, opt) (#52)

3.3.0 / 2016-10-14
==================

  * feat: support promise (#51)

3.2.5 / 2016-08-19
==================

  * fix: return istanbul_bin_path if exists (#50)

3.2.4 / 2016-07-08
==================

  * fix: generator coverage.json to $PWD/coverage (#49)

3.2.3 / 2016-07-08
==================

  * fix: always use the cwd of the main process

3.2.2 / 2016-06-15
==================

  * style: use eslint-config-egg
  * fix: catch resolve when process.env._ is not found

3.2.1 / 2016-02-26
==================

  * fix: assert the wrong type, less testcase :sweat:

3.2.0 / 2016-02-26
==================

  * feat: call .expect/notExpect after end

3.1.1 / 2016-02-24
==================

  * fix: disable debug

3.1.0 / 2016-02-24
==================

  * feat: debug from COFFEE_DEBUG
  * feat: add .notExpect method

3.0.3 / 2016-01-14
==================

  * fix: should init and restore coffee_inject_istanbul

3.0.2 / 2016-01-09
==================

  * fix: process.env._ may not exist in webstorm

3.0.1 / 2016-01-07
==================

  * fix: should inject coverage when start with istanbul

3.0.0 / 2016-01-05
==================

  * feat: ignore coverage or not by .coverage()
  * feat: spawn without .end, use nextTick (break change)
  * feat: pass a number to .debug

2.1.0 / 2015-11-17
==================

  * feat: export this.proc

2.0.0 / 2015-10-31
==================

  * feat: easy to intergrate with instanbul
  * deps: upgrade childprocess to 2

1.3.1 / 2015-10-29
==================

  * fix: callback trigger twice when it throws

1.3.0 / 2015-10-29
==================

  * feat: pass stdout, stderr and code in end callback

1.2.0 / 2015-09-01
==================

  * feat: support options.autoCoverage to enable code coverage with istanbul
  * chore: eslint instead of jshint
  * test: coverage 100%
  * feat: add codecov.io
  * doc(readme): fixed example code

1.1.0 / 2015-05-23
==================

- feat: expect error
- chore: use pkg.files
- chore: use pkg.scripts
- feat: Write data to process.stdout and process.stderr for debug
- fix coveralls image

1.0.1 / 2015-05-15
==================

- fix: condition when use stdio: inherit

1.0.0
==================

First commit
