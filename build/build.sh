#!/bin/bash
NAME=`jq .name < ../src/manifest.json | sed 's/"//g'`
VERSION=`jq .version < ../src/manifest.json | sed 's/"//g'`
[ -f $NAME*.xpi ] && rm $NAME*.xpi
[ -d $NAME-*/ ] && rm -rf $NAME-*/
mkdir $NAME-$VERSION
cp ../README.md ./$NAME-$VERSION/README.md
cp ../LICENSE ./$NAME-$VERSION/LICENSE
cp ../src/manifest.json ./$NAME-$VERSION/manifest.json
cp ../src/openLinks.html ./$NAME-$VERSION/openLinks.html
cp ../src/background.html ./$NAME-$VERSION/background.html
cp ../src/style.css ./$NAME-$VERSION/style.css
mkdir ./$NAME-$VERSION/scripts
tsc --project ../src/tsconfig.json --outDir ./$NAME-$VERSION/scripts
cp ../node_modules/webextension-polyfill/dist/browser-polyfill.min.js ./$NAME-$VERSION/scripts/browser-polyfill.min.js
mkdir ./$NAME-$VERSION/icons
cp ../icons/links-icon-32.png ./$NAME-$VERSION/icons/links-icon-32.png
cp ../icons/links-icon-48.png ./$NAME-$VERSION/icons/links-icon-48.png
cp ../icons/links.svg ./$NAME-$VERSION/icons/links.svg
cd $NAME-$VERSION
zip -r ../$NAME-$VERSION.zip *
cp ../$NAME-$VERSION.zip ../$NAME-$VERSION.xpi