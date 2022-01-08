import { IResponseError, ResponseErrorKind   } from 'pinaple_types/dist/http';
import { initPool, query } from 'pinaple_www/dist/pool';
import { validateSchemaIn, validateSchemaOut, hashString } from './common';
import { environment } from './environment';

const Router = require('@koa/router');
const Ajv = require("ajv");
const { v1: uuidv1 } = require('uuid');

const PROJECT = environment.appName;
const FILE = 'user.ts';

const ajv = new Ajv();

export const router = new Router();

const pool = initPool(environment.pgAdUser, environment.pgAdHost, environment.pgAdDatabase, environment.pgAdPassword, environment.pgAdPort); 

async function rollback() {
  try {
    await query(pool, 'rollback');
  } catch(err) {
  }
}

const schemaAdCreateIn = ajv.compile({
  type: 'object',
  properties: {
    categoryId: {type: 'string'},
    subCategoryId: {type: 'string'},
    text: {type: 'string'},
    images: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          imageBigUrl: {type: 'string'},
          imageThumbUrl: {type: 'string'}
        }
      }
    }
  },
  required: [
    "categoryId",
    "subCategoryId",
    "text",
    "images"
  ],
  additionalProperties: false,
});
const schemaAdCreateOut = ajv.compile({
  type: 'object',
  properties: {
    adId: {type: 'string'}
  },
  required: [
    "adId",
  ],
  additionalProperties: false,
});
router.post('/ad', async (ctx) => {
  const FUNC = 'router.post(/ad)';

  try {
    if (!validateSchemaIn(schemaAdCreateIn, ctx)) {
      return;
    }

    let sql = 'select id from sub_category where id=$1';
    let params = [ctx.request.body.subCategoryId];
    let qres = await query(pool, sql, params);
    if (qres.rows.length < 1) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: 'no such subCategoryId'
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    } 
    

    sql = 'select id from category where id=$1';
    params = [ctx.request.body.categoryId];
    qres = await query(pool, sql, params);
    if (qres.rows.length < 1) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: 'no such categoryId'
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    } 

    await query(pool, 'begin')

    let ad_id = uuidv1(); 
    sql = 'insert into ad(id, sub_category_id, text, created_at) values ($1, $2, $3, CURRENT_TIMESTAMP)';
    params = [ad_id, ctx.request.body.subCategoryId, ctx.request.body.text];
    try {
      await query(pool, sql, params);
    } catch(err) {
      await rollback();

      console.error(`${PROJECT}:${FILE}:${FUNC} error: ${err}`, err);
      let body: IResponseError = {
        errKind: ResponseErrorKind.INTERNAL_ERROR,
        data: {
          message: 'internal error'
        }
      };
      ctx.response.status = 500;
      ctx.response.body = body;
      return;
    }

    interface IImage {
      imageBigUrl: string,
      imageThumbUrl: string,
    }

    for (let image of ctx.request.body.images as IImage[]) {
      let image_id = uuidv1(); 

      sql = `insert into ad_image_big(id, ad_id, url) values ($1, $2, $3)`;
      params = [image_id, ad_id, image.imageBigUrl];
      try {
        await query(pool, sql, params);
      } catch(err) {
        await rollback();

        console.error(`${PROJECT}:${FILE}:${FUNC} error: ${err}`, err);
        let body: IResponseError = {
          errKind: ResponseErrorKind.INTERNAL_ERROR,
          data: {
            message: 'internal error'
          }
        };
        ctx.response.status = 500;
        ctx.response.body = body;
        return;
      }

      sql = `insert into ad_image_thumb(id, ad_id, url) values ($1, $2, $3)`;
      params = [image_id, ad_id, image.imageThumbUrl];
      try {
        await query(pool, sql, params);
      } catch(err) {
        await rollback();

        console.error(`${PROJECT}:${FILE}:${FUNC} error: ${err}`, err);
        let body: IResponseError = {
          errKind: ResponseErrorKind.INTERNAL_ERROR,
          data: {
            message: 'internal error'
          }
        };
        ctx.response.status = 500;
        ctx.response.body = body;
        return;
      }
    }

    await query(pool, 'end')

    ctx.response.status = 200;
    ctx.response.body = {
      adId: ad_id
    };

    if (!validateSchemaOut(schemaAdCreateOut, ctx)) {
      return;
    }
    return;

  } catch(err) {

    rollback();


    console.error(`${PROJECT}:${FILE}:${FUNC} error: ${err}`, err);
    let body: IResponseError = {
      errKind: ResponseErrorKind.INTERNAL_ERROR,
      data: {
        message: 'internal error'
      }
    };
    ctx.response.status = 500;
    ctx.response.body = body;
    return;
  }


});

const schemaAdReadOut = ajv.compile({
  type: 'object',
  properties: {
    id: {type: 'string'},
    createdAt: {type: 'string'},
    text: {type: 'string'},
    categoryId: {type: 'string'},
    categoryName: {type: 'string'},
    subCategoryId: {type: 'string'},
    subCategoryName: {type: 'string'},
    images: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          imageBigUrl: {type: 'string'},
          imageThumbUrl: {type: 'string'},
        },
        required: [
          'imageBigUrl',
          'imageThumbUrl',
        ]
      }
    }
  },
  required: [
    'id',
    'createdAt',
    'text',
    'categoryId',
    'categoryName',
    'subCategoryId',
    'subCategoryName',
    'images',
  ],
  additionalProperties: false,
});
router.get('/ad', async (ctx) => {
  const FUNC = 'router.get(/ad)';

  try {
    if (!ctx.request.query.adId) {

      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: `'adId' query parameter required`
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    let ad_id = ctx.request.query.adId;

    let sql = 'select id, url from ad_image_big where ad_id=$1'; 
    let params = [ad_id]; 
    let qres = await query(pool, sql, params);
    let images = [];
    interface IImage {
      imageBigUrl: string;
      imageThumbUrl: string;
    }
    for (let row of qres.rows) {
      let image: IImage = {
        imageBigUrl: '',
        imageThumbUrl: '',
      };
      image.imageBigUrl = row.url;
      let image_id = row.id;

      sql = 'select url from ad_image_thumb where id=$1 and ad_id=$2'; 
      params = [image_id, ad_id]; 
      let qresT = await query(pool, sql, params);
      if (qresT.rows.length === 1) {
        image.imageThumbUrl = qresT.rows[0].url;
      }

      images.push(image);
    }

    sql = 'select sub_category_id, text, created_at from ad where id=$1';
    params = [ad_id];
    qres = await query(pool, sql, params);
    if (qres.rows.length < 1) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.NOT_FOUND,
        data: {
          message: 'no found'
        }
      };
      ctx.response.status = 404;
      ctx.response.body = body;
      return;
    }

    let sub_category_id = qres.rows[0].sub_category_id;
    let text = qres.rows[0].text;
    let created_at = qres.rows[0].created_at;

    sql = 'select name, category_id from sub_category where id=$1';
    params = [sub_category_id];
    qres = await query(pool, sql, params);
    if (qres.rows.length < 1) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.NOT_FOUND,
        data: {
          message: 'subcategory not found'
        }
      };
      ctx.response.status = 404;
      ctx.response.body = body;
      return;
    }
    let sub_category_name = qres.rows[0].name;
    let category_id = qres.rows[0].category_id; 

    sql = 'select name from category where id=$1';
    params = [category_id];
    qres = await query(pool, sql, params);
    if (qres.rows.length < 1) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.NOT_FOUND,
        data: {
          message: 'category not found'
        }
      };
      ctx.response.status = 404;
      ctx.response.body = body;
      return;
    }
    let category_name = qres.rows[0].name;

    ctx.response.status = 200;
    ctx.response.body = {
      id: ad_id,
      createdAt: created_at.toISOString(),
      text: text,
      categoryId: category_id,
      categoryName: category_name,
      subCategoryId: sub_category_id,
      subCategoryName: sub_category_name,
      images: images,
    };

    if (!validateSchemaOut(schemaAdReadOut, ctx)) {
      return;
    }
    return;

  } catch(err) {

    console.error(`${PROJECT}:${FILE}:${FUNC} error: ${err}`, err);
    let body: IResponseError = {
      errKind: ResponseErrorKind.INTERNAL_ERROR,
      data: {
        message: 'internal error'
      }
    };
    ctx.response.status = 500;
    ctx.response.body = body;
    return;
  }


});

const schemaCategoriesReadOut = ajv.compile({
  type: 'object',
  properties: {
    categories: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {type: 'string'},
          name: {type: 'string'}
        },
        required: [
          'id',
          'name',
        ]
      }
    }
  },
  required: [
    'categories',
  ],
  additionalProperties: false,
});
router.get('/categories', async (ctx) => {
  const FUNC = 'router.get(/categories)';

  try {

    let sql = 'select id, name from category'; 
    let params = [];
    let qres = await query(pool, sql, params);
    let categories = []
    for (let row of qres.rows) {
      categories.push({
        id: row.id,
        name: row.name,
      });
    }

    ctx.response.status = 200;
    ctx.response.body = {
      categories: categories,
    };

    if (!validateSchemaOut(schemaCategoriesReadOut, ctx)) {
      return;
    }
    return;

  } catch(err) {

    console.error(`${PROJECT}:${FILE}:${FUNC} error: ${err}`, err);
    let body: IResponseError = {
      errKind: ResponseErrorKind.INTERNAL_ERROR,
      data: {
        message: 'internal error'
      }
    };
    ctx.response.status = 500;
    ctx.response.body = body;
    return;
  }

});

const schemaSubCategoriesReadOut = ajv.compile({
  type: 'object',
  properties: {
    categoryId: {type: 'string'},
    categoryName: {type: 'string'},
    subCategories: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {type: 'string'},
          name: {type: 'string'}
        },
        required: [
          'id',
          'name',
        ]
      }
    }
  },
  required: [
    'categoryId',
    'categoryName',
    'subCategories',
  ],
  additionalProperties: false,
});
router.get('/subCategories', async (ctx) => {
  const FUNC = 'router.get(/subCategories)';

  try {
    if (!ctx.request.query.categoryId) {

      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: `'categoryId' query parameter required`
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }
    let category_id = ctx.request.query.categoryId;

    let sql = 'select name from category where id=$1'; 
    let params = [category_id];
    let qres = await query(pool, sql, params);
    if (qres.rows.length < 1) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.NOT_FOUND,
        data: {
          message: 'category not found'
        }
      };
      ctx.response.status = 404;
      ctx.response.body = body;
      return;
    }
    let category_name = qres.rows[0].name;


    sql = 'select id, name from sub_category where category_id=$1'; 
    params = [category_id];
    qres = await query(pool, sql, params);
    let subCategories = []
    for (let row of qres.rows) {
      subCategories.push({
        id: row.id,
        name: row.name,
      });
    }

    ctx.response.status = 200;
    ctx.response.body = {
      categoryId: category_id,
      categoryName: category_name,
      subCategories: subCategories,
    };

    console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ cp 500');
    console.dir(ctx.response.body);

    if (!validateSchemaOut(schemaSubCategoriesReadOut, ctx)) {
      return;
    }
    return;

  } catch(err) {
    console.error(`${PROJECT}:${FILE}:${FUNC} error: ${err}`, err);
    let body: IResponseError = {
      errKind: ResponseErrorKind.INTERNAL_ERROR,
      data: {
        message: 'internal error'
      }
    };
    ctx.response.status = 500;
    ctx.response.body = body;
    return;
  }
})

