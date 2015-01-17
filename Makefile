# if you invoke make as 'make V=1' it will verbosely list what it is
# doing, otherwise it defaults to pretty mode, which makes build
# errors _much_ easier to see
ifneq ($V, 1)
MAKEFLAGS = -s
endif

all: check dist

dist: dist/btscale.js dist/btscale.min.js

lib/bower_components:
	bower install
	touch $@

node_modules: package.json
	npm install
	touch $@

node_modules/.bin/r.js: node_modules lib/bower_components
	touch $@

dist/btscale.js: node_modules/.bin/r.js build.js lib/*.js
	mkdir -p dist
	node_modules/.bin/r.js -o build.js

dist/btscale.min.js: node_modules/.bin/r.js build_min.js lib/*.js
	mkdir -p dist
	node_modules/.bin/r.js -o build_min.js

hint:
	node_modules/.bin/jshint --config .jshintrc lib/*.js

clean:
	rm -rf dist dist/btscale.js dist/btscale.min.js

check: node_modules lib/bower_components
	node_modules/.bin/nodeunit test/runner.js

.PHONY: all www hint jsdeps clean check
