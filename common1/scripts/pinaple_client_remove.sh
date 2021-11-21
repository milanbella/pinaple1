#!/bin/bash
set -x
curl --header "Content-Type: application/json" \
  --request DELETE \
  --data-binary '@json/pinaple_client_remove.json' \
  http://pinaple-api/client
