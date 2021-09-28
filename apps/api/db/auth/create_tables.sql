create table auth.users (
  id varchar(50) not null primary key,
  user_name varchar(50) not null, 
  email    varchar(100) not null,
  password varchar(150) not null
);
