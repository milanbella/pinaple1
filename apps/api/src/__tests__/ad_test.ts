import { environment } from '../environment';
import { httpGet, httpPost, HttpError } from 'pinaple_www/dist/http';
import { initPool, releasePool, query  } from 'pinaple_www/dist/pool';
import { url } from './common';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fetch = require('node-fetch');
const { v1: uuidv1 } = require('uuid');


const pool = initPool(environment.pgAdUser, environment.pgAdHost, environment.pgAdDatabase, environment.pgAdPassword, environment.pgAdPort); 

let category_id_1 = uuidv1();
let sub_category_id_1_1 = uuidv1();
let sub_category_id_1_2 = uuidv1();
let sub_category_id_1_3 = uuidv1();

let category_id_2 = uuidv1();
let sub_category_id_2_1 = uuidv1();
let sub_category_id_2_2 = uuidv1();
let sub_category_id_2_3 = uuidv1();

async function createData() {
  await query(pool, "insert into category(id, name) values ($1, $2)", [category_id_1, 'test category 1']);
  await query(pool, "insert into category(id, name) values ($1, $2)", [category_id_2, 'test category 2']);


  await query(pool, "insert into sub_category(id, category_id, name) values ($1, $2, $3)", [sub_category_id_1_1, category_id_1, 'test sub category 1']);
  await query(pool, "insert into sub_category(id, category_id, name) values ($1, $2, $3)", [sub_category_id_1_2, category_id_1, 'test sub category 2']);
  await query(pool, "insert into sub_category(id, category_id, name) values ($1, $2, $3)", [sub_category_id_1_3, category_id_1, 'test sub category 3']);

  await query(pool, "insert into sub_category(id, category_id, name) values ($1, $2, $3)", [sub_category_id_2_1, category_id_2, 'test sub category 1']);
  await query(pool, "insert into sub_category(id, category_id, name) values ($1, $2, $3)", [sub_category_id_2_2, category_id_2, 'test sub category 2']);
  await query(pool, "insert into sub_category(id, category_id, name) values ($1, $2, $3)", [sub_category_id_2_3, category_id_2, 'test sub category 3']);
}

async function removeData() {
  await query(pool, "delete from ad_image_big where url like 'test%' ");
  await query(pool, "delete from ad_image_thumb where url like 'test%' ");
  await query(pool, "delete from ad where text like 'test%' ");
  await query(pool, "delete from sub_category where name like 'test%' ");
  await query(pool, "delete from category where name like 'test%' ");
}

beforeEach(async () => {
  await removeData();
  await createData();
})

afterAll(async () => {
  await removeData();
  await releasePool(pool);
});


test('Create new ad.', async () => {
  let hres = await httpPost(`${url()}/ad`, {
    categoryId: category_id_1,
    subCategoryId: sub_category_id_1_2,
    text: 'test: I am selling this cool car for almost free',
    images: [
      {
        imageBigUrl: 'test: http://foo.com/imageBig1.jpg',
        imageThumbUrl: 'test: http://foo.com/imageThumb1.jpg',
      },
      {
        imageBigUrl: 'test: http://foo.com/imageBig2.jpg',
        imageThumbUrl: 'test: http://foo.com/imageThumb2.jpg',
      }
    ]
  });
  expect(hres.adId).toBeDefined();
})

test('Read ad.', async () => {
  let hres = await httpPost(`${url()}/ad`, {
    categoryId: category_id_1,
    subCategoryId: sub_category_id_1_2,
    text: 'test: I am selling this cool car for almost free',
    images: [
      {
        imageBigUrl: 'test: http://foo.com/imageBig1.jpg',
        imageThumbUrl: 'test: http://foo.com/imageThumb1.jpg',
      },
      {
        imageBigUrl: 'test: http://foo.com/imageBig2.jpg',
        imageThumbUrl: 'test: http://foo.com/imageThumb2.jpg',
      }
    ]
  });
  expect(hres.adId).toBeDefined();

  let adId = hres.adId 
  hres = await httpGet(`${url()}/ad?adId=${adId}`)
  expect(hres.id).toBe(adId);
  expect(hres.images[0].imageBigUrl).toBe('test: http://foo.com/imageBig1.jpg');
  expect(hres.images[1].imageThumbUrl).toBe('test: http://foo.com/imageThumb2.jpg');
})

test('Read categories', async () => {
  let hres = await httpGet(`${url()}/categories`)
  expect(hres.categories[0].name).toBe('test category 1')
  expect(hres.categories[1].name).toBe('test category 2')
})

test('Read sub categories', async () => {
  let hres = await httpGet(`${url()}/subCategories?categoryId=${category_id_1}`);
  expect(hres.categoryName).toBe('test category 1');
  expect(hres.subCategories[1].name).toBe('test sub category 2');
})
