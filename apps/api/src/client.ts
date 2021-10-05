import { IResponseError, ResponseErrorKind   } from 'types/dist/http';
import { query } from 'www/dist/pool';
import { validateSchema } from './common';
import { responseInternalError, responseBadRequest, responseOk, responseUnauthorized } from './common';
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
    redirect_uri: {type: 'string'},
  },
  required: [
    'redirect_uri',
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
    let redirect_uri = ctx.request.body.redirect_uri;

    let sql = `insert into auth.client(id, name, redirect_uri) values ($1, $2, $3)`;
    let params = [id, name, redirect_uri];

    let qres = await query(sql, params);

    ctx.status = 200;
    ctx.response.body = {
      id: id
    };

  } catch(err) {
    console.error(`${FILE}:${FUNC} error: ${err}`, err);
    responseInternalError(ctx);
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
    responseInternalError(ctx);
    return;
  }

})
