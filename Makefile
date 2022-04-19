install: install-deps

run:
	npx babel-node 'src/bin/password-generator.js' production

dev:
	npx nodemon --delay 1 --exec babel-node 'src/bin/password-generator.js' developer

install-deps:
	npm ci

build:
	rm -rf dist
	npm run build

test:
	npm test

test-coverage:
	nyc npm run test

lint:
	npx eslint .

package:
  npm pack

publish:
	npm publish

update-deps:
	npx npm-check-updates -u
