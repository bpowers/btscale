
GULP      ?= node_modules/.bin/gulp
TSLINT    ?= node_modules/.bin/tslint
MOCHA     ?= node_modules/.bin/mocha
BOWER     ?= node_modules/.bin/bower
ALMOND    ?= src/bower_components/almond/almond.js

BUILD_DEPS   = $(GULP) $(TSLINT) $(MOCHA) $(BOWER) $(ALMOND)

# quiet output, but allow us to look at what commands are being
# executed by passing 'V=1' to make, without requiring temporarily
# editing the Makefile.
ifneq ($V, 1)
MAKEFLAGS += -s
endif

# GNU make, you are the worst.
.SUFFIXES:
%: %,v
%: RCS/%,v
%: RCS/%
%: s.%
%: SCCS/s.%

all: test

build lib: $(BUILD_DEPS)
	@echo "  LIB"
	$(GULP) lib

test: $(BUILD_DEPS)
	@echo "  TEST"
	$(GULP)

dist: test
	@echo "  DIST"
	$(GULP)

node_modules: package.json
	@echo "  NPM"
	npm install --silent
	touch -c $@

src/bower_components: node_modules bower.json
	@echo "  BOWER"
	$(BOWER) install --silent
	touch -c $@


$(BUILD_DEPS): node_modules src/bower_components
	touch -c $@

clean:
	rm -rf lib test/*.js
	find . -name '*~' | xargs rm -f

distclean: clean
	rm -rf node_modules

.PHONY: all clean distclean dist test
