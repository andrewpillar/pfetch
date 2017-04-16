

# Actual Makefile for Linux dev

all:
	tail -n +3 src/pfetch.js > src/pfetch-lite.js
	npm run build
	npm run dist:lite
	npm run dist
	rm src/pfetch-lite.js
