#!/bin/bash

# Enter temporary working space
mkdir ./tmp
cd ./tmp

# Create json translation files
curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
php wp-cli.phar i18n make-json ../ --no-purge '--use-map={"blocks/mymovi-form-input/src/edit.js":"blocks/mymovi-form-input/build/index.js"}'

# Remove temporary working space
cd ../
rm -r ./tmp