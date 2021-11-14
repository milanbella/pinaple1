#!/bin/bash
set -xe
npx tsc
if [ ! -d dist/styles ]; then
  mkdir dist/styles
fi;
cp -r styles/* dist/styles 
