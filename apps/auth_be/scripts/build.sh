#!/bin/bash
env=$1
cp src/environment_${env}.ts src/environment.ts
tsc
