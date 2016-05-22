serve: node_modules
	@$</.bin/serve -Slojp 0

test: node_modules
	@$</.bin/_hydro test/*.test.js \
		--formatter $</hydro-dot \
		--setup $</future-node \
		--setup test/hydro.conf.js \

node_modules: package.json
	@npm install

.PHONY: serve test
