scripts/createdb.sh
scripts/createuser.sh
psql -U postgres -h localhost -p 5433
\c ad
\ir create_schema.sql
\ir grant.sql
\q
psql -U ad -h localhost -p 5433
\ir create_tables.sql
