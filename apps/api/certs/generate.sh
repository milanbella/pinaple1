#!/bin/bash
set -xe
openssl req -x509 -days 10000 -newkey rsa:4096 \
-keyout key.pem -out cert.pem \
-subj "/C=US/ST=CA/L=San/CN=localhost/emailAddress=localhost@oracle.com" -nodes

openssl pkcs8 -topk8 \
-inform PEM -outform PEM \
-in key.pem -out key-pkcs8.pem -nocrypt
