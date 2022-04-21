#
#  ___                              _    ___                       _
# | _ \__ _ _______ __ _____ _ _ __| |  / __|___ _ _  ___ _ _ __ _| |_ ___ _ _
# |  _/ _` (_-<_-< V  V / _ \ '_/ _` | | (_ / -_) ' \/ -_) '_/ _` |  _/ _ \ '_|
# |_| \__,_/__/__/\_/\_/\___/_| \__,_|  \___\___|_||_\___|_| \__,_|\__\___/_|
#
# Password Generator
# https://password-generator.pro/
#
# Copyright (c) Sebastien Rousseau 2022. All rights reserved
# Licensed under the MIT license
#

# Run commands with the node debugger. (default: false)
DEBUG ?= false

ifeq ($(DEBUG),false)
	node = node
else
	node = node debug
endif

.DEFAULT_GOAL := help
.PHONY: all run clean

# @HELP Install.
install:
	@echo
	@echo "Installing..."
	install-deps

# @HELP Run password-generator.
run:
	@echo
	@echo "Running the password-generator..."
	npx node . -t base64 -l 8 -i 4 -s -

# @HELP Run the developer password-generator.
dev:
	@echo
	@echo "Running the developer password-generator..."
	npx nodemon --delay 1 --exec node 'dist/src/index.js' developer

# @HELP Install npm dependencies.
install-deps:
	@echo
	@echo "Installing npm dependencies..."
	npm ci

# @HELP Build.
build:
	@echo
	@echo "Building..."
	rm -rf dist
	npm run build

# @HELP Unit tests.
test:
	@echo
	@echo "Checking Unit tests..."
	npm test

# @HELP Test Coverage.
test-coverage:
	@echo
	@echo "Checking Test Coverage..."
	npm run coverage

# @HELP Run eslint.
lint:
	@echo
	@echo "Running eslint..."
	npx eslint .

# @HELP Publish.
publish:
	@echo
	@echo "Publishing password-generator..."
	npm publish

# @HELP NPM check updates.
update-deps:
	@echo
	@echo "Checking npm updates..."
	npx npm-check-updates -u

# @HELP Display the help menu.
help:
	@ echo
	@ echo '  Usage:'
	@ echo ''
	@ echo '    make <target> [flags...]'
	@ echo ''
	@ echo '  Targets:'
	@ echo ''
	@ awk '/^#/{ comment = substr($$0,3) } comment && /^[a-zA-Z][a-zA-Z0-9_-]+ ?:/{ print "   ", $$1, comment }' $(MAKEFILE_LIST) | column -t -s ':' | sort
	@ echo ''
	@ echo '  Flags:'
	@ echo ''
	@ awk '/^#/{ comment = substr($$0,3) } comment && /^[a-zA-Z][a-zA-Z0-9_-]+ ?\?=/{ print "   ", $$1, $$2, comment }' $(MAKEFILE_LIST) | column -t -s '?=' | sort
	@ echo ''
