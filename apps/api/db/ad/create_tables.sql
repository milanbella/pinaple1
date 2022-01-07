create table ad.category (
  id varchar(50) not null primary key,
  name varchar(50) not null 
);

create table ad.sub_category (
  id varchar(50) not null primary key,
  name varchar(50) not null, 
  category_id varchar(50) not null references ad.category(id) 
);
create index sub_category__category_id on ad.sub_category(category_id);

create table ad.ad (
  id varchar(50) not null primary key,
  text varchar(5000)
  sub_category_id varchar(50) not null references ad.sub_category(id), 
  created_at timestamp with time zone  not null;
);
create index ad__sub_category_id on ad.ad(sub_category_id);

create table ad.ad_image_big (
  id varchar(50) not null primary key,
  ad_id varchar(50) not null references ad.ad(id),  
  url varchar(200) not null
);
create index ad_image_big__ad_id on ad.ad_image_big(ad_id); 

create table ad_image_thumb (
  id varchar(50) not null primary key,
  ad_id varchar(50) not null references ad.ad(id),  
  url varchar(200) not null
);
create index ad_image_thumb__ad_id on ad.ad_image_thumb(ad_id);

