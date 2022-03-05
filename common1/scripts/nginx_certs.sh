#!/bin/bash
set -x
mkdir -p nginx/certs
rm -rf nginx/certs/*
openssl req -x509 -newkey rsa:4096 -keyout nginx/certs/key_pinaple_api_l.pem -out nginx/certs/cert_pinaple_api_l.pem -sha256 -days 10000 -nodes -subj '/C=xx/ST=unknown/L=unknown/O=unknown/OU=unknown/CN=pinaple-api-l'
openssl req -x509 -newkey rsa:4096 -keyout nginx/certs/key_pinaple_auth_l.pem -out nginx/certs/cert_pinaple_auth_l.pem -sha256 -days 10000 -nodes -subj '/C=xx/ST=unknown/L=unknown/O=unknown/OU=unknown/CN=pinaple-auth-l'
openssl req -x509 -newkey rsa:4096 -keyout nginx/certs/key_pinaple_app_l.pem -out nginx/certs/cert_pinaple_app_l.pem -sha256 -days 10000 -nodes -subj '/C=xx/ST=unknown/L=unknown/O=unknown/OU=unknown/CN=pinaple-app-l'
