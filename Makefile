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

.DEFAULT_GOAL := help

#
# Build tasks
#

# @HELP Install.
install:
	@echo
	@echo "Installing..."
	install-deps

# @HELP Install npx dependencies.
install-deps:
	@echo
	@echo "Installing npx dependencies..."
	npx ci

# @HELP npx check updates.
update-deps:
	@echo
	@echo "Checking npx updates..."
	npx npm-check-updates -u

# @HELP Build.
build:
	@echo
	@echo "Building..."
	rm -rf dist
	npx run build

# @HELP Publish.
publish:
	@echo
	@echo "Publishing password-generator..."
	npx publish


#
# Node Module
#

# @HELP node_modules.
node_modules: package.json
	@npm install


#
# Run tasks
#

# @HELP Run directory clean.
run: run-base64 run-strong run-memorable

# @HELP Run base64 password-generator.
run-base64:
	@echo
	@echo "Running an example of a base64 password-generator..."
	npx node . -t base64 -l 8 -i 4 -s -

# @HELP Run strong password-generator.
run-strong:
	@echo
	@echo "Running an example of a strong password-generator..."
	npx node . -t strong -l 8 -i 4 -s -

# @HELP Run base64 password-generator.
run-memorable:
	@echo
	@echo "Running an example of a memorable password-generator..."
	npx node . -t memorable -i 4 -s -


#
# Clean up tasks
#

# @HELP Run directory clean.
clean: clean-node clean-cov

# @HELP Run node_modules clean.
clean-node:
	@rm -rf node_modules

# @HELP Run coverage coverage.
clean-cov:
	@rm -rf coverage


#
# Testing tasks
#

# @HELP Unit test.
test:
	@echo
	@echo "Checking Unit tests..."
	npx c8 mocha


# @HELP Unit test coverage.
coverage:
	@echo
	@echo "Checking Test Coverage..."
	npx c8 mocha \"test/*.js\" \"./test/**/*.js\"

# @HELP Run eslint.
lint:
	@echo
	@echo "Running eslint..."
	npx eslint .

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


.PHONY: clean, clean-cov, clean-node, coverage, help, install, install-deps, lint, node_modules, publish, run, run-base64, run-memorable, run-strong, test, update-deps
