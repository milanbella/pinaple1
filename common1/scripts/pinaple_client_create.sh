#!/bin/bash
set -x
curl --header "Content-Type: application/json" \
  --request POST \
  --data-binary '@json/pinaple_client_create.json' \
  http://pinaple-api/client
