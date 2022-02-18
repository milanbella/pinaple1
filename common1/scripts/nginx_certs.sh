#!/bin/bash
set -x
mkdir -p nginx/certs
rm -rf nginx/certs/*
openssl req -x509 -newkey rsa:4096 -keyout nginx/certs/key_pinaple_api.pem -out nginx/certs/cert_pinaple_api.pem -sha256 -days 10000 -nodes -subj '/C=xx/ST=unknown/L=unknown/O=unknown/OU=unknown/CN=pinaple-api-l'
openssl req -x509 -newkey rsa:4096 -keyout nginx/certs/key_pinaple_auth.pem -out nginx/certs/cert_pinaple_auth.pem -sha256 -days 10000 -nodes -subj '/C=xx/ST=unknown/L=unknown/O=unknown/OU=unknown/CN=pinaple-auth-l'
openssl req -x509 -newkey rsa:4096 -keyout nginx/certs/key_pinaple_app.pem -out nginx/certs/cert_pinaple_app.pem -sha256 -days 10000 -nodes -subj '/C=xx/ST=unknown/L=unknown/O=unknown/OU=unknown/CN=pinaple-app-l'

cp ../apps/api/cert_l.pem nginx/certs/cert_api.pem
cp ../apps/auth_be/cert_l.pem nginx/certs/cert_auth_be.pem
cp ../apps/app_be/cert_l.pem nginx/certs/cert_app_be.pem

