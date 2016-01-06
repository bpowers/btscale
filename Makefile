
GULP      ?= node_modules/.bin/gulp
TSLINT    ?= node_modules/.bin/tslint
MOCHA     ?= node_modules/.bin/mocha

BUILD_DEPS   = $(GULP) $(TSLINT) $(MOCHA)

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

node_modules: package.json
	@echo "  NPM"
	npm install --silent
	touch -c $@

$(BUILD_DEPS): node_modules
	touch -c $@

clean:
	rm -rf lib
	find . -name '*~' | xargs rm -f

distclean: clean
	rm -rf node_modules

.PHONY: all clean distclean test
