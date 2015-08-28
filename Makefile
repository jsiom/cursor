serve: node_modules
	@$</.bin/serve -Slojp 0

test: node_modules
	@$</.bin/hydro test/*.test.js \
		--formatter $</hydro-dot \
		--setup test/hydro.conf.js

node_modules: package.json
	@npm install
	@ln -sfn .. $@/cursor

.PHONY: serve test
