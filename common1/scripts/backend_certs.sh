set -x
openssl req -x509 -newkey rsa:4096 -keyout ../apps/api/key.pem -out ../apps/api/cert.pem -sha256 -days 10000 -nodes -subj '/C=xx/ST=unknown/L=unknown/O=unknown/OU=unknown/CN=pinaple-api'
openssl req -x509 -newkey rsa:4096 -keyout ../apps/auth_be/key.pem -out ../apps/auth_be/cert.pem -sha256 -days 10000 -nodes -subj '/C=xx/ST=unknown/L=unknown/O=unknown/OU=unknown/CN=pinaple-auth'
openssl req -x509 -newkey rsa:4096 -keyout ../apps/app_be/key.pem -out ../apps/app_be/cert.pem -sha256 -days 10000 -nodes -subj '/C=xx/ST=unknown/L=unknown/O=unknown/OU=unknown/CN=pinaple-app'
openssl req -x509 -newkey rsa:4096 -keyout ../apps/img/key.pem -out ../apps/img/cert.pem -sha256 -days 10000 -nodes -subj '/C=xx/ST=unknown/L=unknown/O=unknown/OU=unknown/CN=pinaple-app'

