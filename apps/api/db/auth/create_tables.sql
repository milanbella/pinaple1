create table auth.users (
  id varchar(50) not null primary key,
  user_name varchar(50) not null, 
  email    varchar(100) not null,
  password varchar(150) not null
);

create table auth.client (
  id varchar(50) not null primary key,
  name varchar(100),
  redirect_uri varchar(250) not null
);

create table auth.oauth_code_token (
  id varchar(50) not null primary key,
  client_id varchar(50) not null,
  user_id varchar(50) not null,
  user_name varchar(50) not null, 
  email    varchar(100) not null,
  issued_at timestamp not null
);

create table auth.oauth_access_token (
  id varchar(50) not null primary key,
  client_id varchar(50) not null,
  user_id varchar(50) not null,
  user_name varchar(50) not null, 
  email    varchar(100) not null,
  issued_at timestamp not null,
  access_token_hash varchar(100) not null,
  refresh_token varchar(100)
);

