import { IResponseError, ResponseErrorKind   } from 'pinaple_types/dist/http';
import { query } from 'pinaple_www/dist/pool';
import { validateSchema } from './common';
import { environment } from './environment';

const Router = require('@koa/router');
const Ajv = require("ajv");
const { v1: uuidv1 } = require('uuid');

const PROJECT = environment.appName;
const FILE = 'oauth.ts';

const ajv = new Ajv();

export const router = new Router();

const schemaClientCreate = ajv.compile({
  type: 'object',
  properties: {
    clientName: {type: 'string'},
    redirectUri: {type: 'string'},
  },
  required: [
    'clientName',
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
    let name = ctx.request.body.clientName || null;
    let redirect_uri = ctx.request.body.redirectUri;

    let sql = `insert into auth.client(id, name, redirect_uri) values ($1, $2, $3)`;
    let params = [id, name, redirect_uri];

    let qres = await query(sql, params);

    ctx.status = 200;
    ctx.response.body = {
      id: id
    };

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

router.get('/client', async (ctx) => {
  const FUNC = 'router.get(/client)';
  try {
    if (!(ctx.request.query.clientId || ctx.request.query.clientName)) {

      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: `'clientId' or 'clientName' parameter required`
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    let clientId = ctx.request.query.clientId;
    let clientName = ctx.request.query.clientName;

    let sql, params;

    if (clientId) {
      sql = `select id, name, redirect_uri from client where id=$1`;
      params = [clientId];
    } else if (clientName) {
      sql = `select id, name, redirect_uri from client where name=$1`;
      params = [clientName];
    } else {
      throw new Error('assertion failed');
    }

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
      console.error(`${PROJECT}:${FILE}:${FUNC}: more then one client found, clientId: ${clientId}, clientName: ${clientName}`)
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

const schemaClientDelete = ajv.compile({
  type: 'object',
  properties: {
    clientId: {type: 'string'},
    clientName: {type: 'string'},
  },
  additionalProperties: false,
});
router.del('/client', async (ctx) => {
  const FUNC = 'router.del(/client)';
  try {

    if (!validateSchema(schemaClientDelete, ctx)) {
      return;
    }

    let clientId = ctx.request.body.clientId;
    let clientName = ctx.request.body.clientName;

    if (!(clientId || clientName)) {
      console.warn(`${PROJECT}:${FILE}:${FUNC} either 'clientId' or 'clientName' or both has to be specified`);
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: `either 'clientId' or 'clientName' has to be specified`
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    if (clientName) {

      let sql = `delete from client where name=$1`;
      let params = [clientName];

      let qres = await query(sql, params);
    }

    if (clientId) {

      let sql = `delete from client where id=$1`;
      let params = [clientId];

      let qres = await query(sql, params);
    }

    ctx.status = 200;
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
