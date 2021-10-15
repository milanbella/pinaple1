import { IResponseError, ResponseErrorKind   } from 'types/dist/http';
import { query } from 'www/dist/pool';
import { validateSchema } from './common';
import { environment } from './environment';

const Router = require('@koa/router');
const Ajv = require("ajv");
const { v1: uuidv1 } = require('uuid');

const FILE = 'oauth.ts';

const ajv = new Ajv();

export const router = new Router();

const schemaClientCreate = ajv.compile({
  type: 'object',
  properties: {
    name: {type: 'string'},
    redirectUri: {type: 'string'},
  },
  required: [
    'name',
    'redirectUri',
  ],
  additionalProperties: false,
});
router.post('/client', async (ctx) => {
  const FUNC = 'router.post(/client)';
  try {
    if (!validateSchema(schemaClientCreate, ctx)) {
      return;
    }

    let id =uuidv1(); 
    let name = ctx.request.body.name || null;
    let redirect_uri = ctx.request.body.redirectUri;

    let sql = `insert into auth.client(id, name, redirect_uri) values ($1, $2, $3)`;
    let params = [id, name, redirect_uri];

    let qres = await query(sql, params);

    ctx.status = 200;
    ctx.response.body = {
      id: id
    };

  } catch(err) {
    console.error(`${FILE}:${FUNC} error: ${err}`, err);
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

router.get('/client', async (ctx) => {
  const FUNC = 'router.get(/client)';
  try {
    if (!ctx.request.query.clientId) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: 'missing \`clientId\' parameter'
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    let clientId = ctx.request.query.clientId;

    let sql = `select id, name, redirect_uri from client where id=$1`;
    let params = [clientId];

    let qres = await query(sql, params);
    if (qres.rows.length < 1) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.NOT_FOUND,
        data: {
          message: 'no such client'
        }
      };
      ctx.response.status = 404;
      ctx.response.body = body;
      return;
    } if (qres.rows.length > 1) {
      console.error(`${FILE}:${FUNC}: more then one client found, clientId: ${clientId}`)
      let body: IResponseError = {
        errKind: ResponseErrorKind.INTERNAL_ERROR,
        data: {
          message: 'internal error'
        }
      };
      ctx.response.status = 500;
      ctx.response.body = body;
      return;
    };

    ctx.status = 200;
    ctx.response.body = {
      clientId: qres.rows[0].id,
      name: qres.rows[0].name,
      redirectUri: qres.rows[0].redirect_uri,
    };

  } catch(err) {
    console.error(`${FILE}:${FUNC} error: ${err}`, err);
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

const schemaClientDelete = ajv.compile({
  type: 'object',
  properties: {
    id: {type: 'string'},
  },
  required: [
    'id',
  ],
  additionalProperties: false,
});

router.del('/client', async (ctx) => {
  const FUNC = 'router.del(/client)';
  try {

    if (!validateSchema(schemaClientDelete, ctx)) {
      return;
    }

    let id = ctx.request.body.id;

    let sql = `delete from client where id=$1`;
    let params = [id];

    let qres = await query(sql, params);

    ctx.status = 200;
    ctx.response.body = {
    };

  } catch(err) {
    console.error(`${FILE}:${FUNC} error: ${err}`, err);
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
