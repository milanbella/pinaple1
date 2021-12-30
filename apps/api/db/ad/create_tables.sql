create table ad.category (
  id varchar(50) not null primary key,
  name varchar(50) not null 
);

create table ad.sub_category (
  id varchar(50) not null primary key,
  name varchar(50) not null 
);

create table ad.ad (
  id varchar(50) not null primary key,
  category_id varchar(50) not null references ad.category(id), 
  sub_category_id varchar(50) not null references ad.sub_category(id), 
  text: varchar(5000)
);

