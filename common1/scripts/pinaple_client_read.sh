#!/bin/bash
set -x
curl --header "Content-Type: application/json" \
  --request GET \
  http://pinaple-api/client?clientName=pinaple
