#!/bin/bash
cd "${0%/*}"
NAME=`jq .name < ../src/manifest.json | sed 's/"//g'`
VERSION=`jq .version < ../src/manifest.json | sed 's/"//g'`
rm $NAME*.xpi
rm -rf ./dist
mkdir dist
cp ../README.md ./dist/README.md
cp ../LICENSE ./dist/LICENSE
cp ../src/manifest.json ./dist/manifest.json
cp ../src/openLinks.html ./dist/openLinks.html
cp ../src/background.html ./dist/background.html
cp ../src/style.css ./dist/style.css
mkdir ./dist/scripts
tsc --build ../src/tsconfig.json
mkdir ./dist/icons
cp ../icons/links-icon-32.png ./dist/icons/links-icon-32.png
cp ../icons/links-icon-48.png ./dist/icons/links-icon-48.png
cp ../icons/links.svg ./dist/icons/links.svg
cd dist
zip -r ../$NAME-$VERSION.zip *
mv ../$NAME-$VERSION.zip ../$NAME-$VERSION.xpi