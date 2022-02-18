#!/bin/bash
set -x
mkdir -p kube/certs 
rm -rf kube/certs/* 
openssl req -x509 -newkey rsa:4096 -keyout kube/certs/key_pinaple_api.pem -out kube/certs/cert_pinaple_api.pem -sha256 -days 10000 -nodes -subj '/C=xx/ST=unknown/L=unknown/O=unknown/OU=unknown/CN=pinaple-api'
openssl req -x509 -newkey rsa:4096 -keyout kube/certs/key_pinaple_auth.pem -out kube/certs/cert_pinaple_auth.pem -sha256 -days 10000 -nodes -subj '/C=xx/ST=unknown/L=unknown/O=unknown/OU=unknown/CN=pinaple-auth'
openssl req -x509 -newkey rsa:4096 -keyout kube/certs/key_pinaple_app.pem -out kube/certs/cert_pinaple_app.pem -sha256 -days 10000 -nodes -subj '/C=xx/ST=unknown/L=unknown/O=unknown/OU=unknown/CN=pinaple-app'
openssl req -x509 -newkey rsa:4096 -keyout kube/certs/key_pinaple_img.pem -out kube/certs/cert_pinaple_img.pem -sha256 -days 10000 -nodes -subj '/C=xx/ST=unknown/L=unknown/O=unknown/OU=unknown/CN=pinaple-img'
