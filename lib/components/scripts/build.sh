#!/bin/bash
set -e
npm run build-next
npm run build-lib 2>&1
