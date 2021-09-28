scripts/createdb.sh
scripts/createuser.sh
psql -U postgres -h localhost -p 5433
\c auth
\ir create_schema.sql
\ir grant.sql
\q
psql -U auth -h localhost -p 5433
\ir create_tables.sql
