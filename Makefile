test: jshint
	@node \
		node_modules/.bin/istanbul cover \
		node_modules/.bin/_mocha -- \
		--reporter spec \
		--timeout 20000

coveralls: test
	@cat ./coverage/lcov.info | ./node_modules/.bin/coveralls

debug:
	@node $(NODE_DEBUG) \
		node_modules/.bin/_mocha \
		--reporter spec \
		--timeout 20000

jshint:
	@./node_modules/.bin/jshint .

.PHONY: test
