set -x
createdb -h localhost -p 5433 -U postgres -T template0 --echo --encoding=UTF8 auth
