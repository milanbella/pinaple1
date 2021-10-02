import { IResponseError, ResponseErrorKind   } from 'types/dist/http';
import { query } from 'www/dist/pool';
import { validateSchema, hashString } from './common';
import { responseInternalError, responseBadRequest, responseOk, responseUnauthorized } from './common';

const Router = require('@koa/router');
const Ajv = require("ajv");
const { v4: uuidv4 } = require('uuid');
const { v1: uuidv1 } = require('uuid');

const FILE = 'oauth.ts';

const ajv = new Ajv();

export const router = new Router();

const schemaOauthCodeIssue = ajv.compile({
  type: 'object',
  properties: {
    client_id: {type: 'string'}, 
    userName: {type: 'string'},
    email: {type: 'string'},
    password: {type: 'string'},
  },
  required: [
    'client_id',
    'password'
  ],
  additionalProperties: false,
});
router.get('/oauth/code/issue', async (ctx) => {
  const FUNC = 'router.get(/oauth/code/issue)';
  try {

    if (!validateSchema(schemaOauthCodeIssue, ctx)) {
      return;
    }

    // Either username or email has to be specified
    
    let sql, params, message, password;
    let userName = ctx.request.body.userName;
    let email = ctx.request.body.email;

    if (userName) {
      sql = "select password from auth.users where user_name=$1";
      params = [userName];
      message = "no such user name";
    } else if (email) {
      sql = "select password from auth.users where email=$1";
      params = [email];
      message = "no such email";
    } else {
      responseBadRequest(ctx, 'either user_name or email parameter has to be specified');
      return;
    }

    let qres = await query(sql, params);
    if (qres.rows.length < 1) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.UNAUTHORIZED,
        data: {
          message: message
        }
      };
      ctx.response.status = 401;
      ctx.response.body = body; 
      return;
    } else if (qres.rows.length > 1) {
      console.error(`${FILE}:${FUNC}: user is not unique, user_name: ${userName}, email: ${email}`)
      responseInternalError(ctx, 'user is not unique');
    } else {
      password = qres.rows[0].password;
    }

    // Verify if password match.

    if (password !== hashString(ctx.request.body.password)) {
      responseUnauthorized(ctx, message);
      return;
    }

    // Issue oauth code
    let code = uuidv4();
    let client_id = ctx.request.client_id;
    sql = 'insert into auth.oauth_code(id, expires_at, client_id) values($1, CURRENT_TIMESTAMP, $2)';
    params = [code, client_id];
    qres = await query(sql, params);

  } catch(err) {
    console.error(`${FILE}:${FUNC} error: ${err}`, err);
    responseInternalError(ctx);
    return;
  }

})

const schemaOauthTokenIssue = ajv.compile({
  type: 'object',
  properties: {
    grant_type: {type: 'string'}, 
    code: {type: 'string'}, 
    redirect_uri: {type: 'string'}, 
    client_id: {type: 'string'},
  },
  required: [
    'grant_type',
    'code',
    'redirect_uri',
    'client_id'
  ],
  additionalProperties: false,
});
router.get('/oauth/token/issue', async (ctx) => {
  const FUNC = 'router.get(/oauth/token/issue)';
  try {
    if (!validateSchema(schemaOauthCodeIssue, ctx)) {
      return;
    }

    let grant_type = ctx.request.body.grant_type;
    if (grant_type !== 'code') {
      responseBadRequest(ctx, 'grant_type must be \'code\'');
      return;
    }

    let client_id, redirect_uri;
    let sql = 'select client_id, redirect_uri from auth.oauth_client where client_id=$1';
    let params = [ctx.request.body.client_id];
    let qres = await query(sql, params);
    if (qres.rows.length < 1) {
      responseUnauthorized(ctx, 'no such client_id');
      return;
    } else if (qres.rows.length > 1) {
      responseInternalError(ctx, 'client_id not unique');
      return;
    } else {
      client_id = qres.rows[0].client_id;
      redirect_uri = qres.rows[0].redirect_uri;
    }

    if (ctx.request.body.redirect_uri !== redirect_uri) {
      responseUnauthorized(ctx, 'unknown redirect_uri');
      return;
    }


  } catch(err) {
    console.error(`${FILE}:${FUNC} error: ${err}`, err);
    responseInternalError(ctx);
    return;
  }

})

const schemaOauthClientCreate = ajv.compile({
  type: 'object',
  properties: {
    redirect_uri: {type: 'string'}, 
  },
  required: [
    'redirect_uri',
  ],
  additionalProperties: false,
});
router.post('/oauth/client', async (ctx) => {
  const FUNC = 'router.get(/oauth/token/issue)';
  try {
    if (!validateSchema(schemaOauthClientCreate, ctx)) {
      return;
    }

    let client_id = uuidv1(); 
    let redirect_uri = ctx.request.body.redirect_uri;

    let sql = 'insert into auth.oauth_client(id, redirect_uri) values($1, $2)';
    let params = [client_id, redirect_uri];
    let qres = await query(sql, params); 

    responseOk(ctx);
    return;


  } catch(err) {
    console.error(`${FILE}:${FUNC} error: ${err}`, err);
    responseInternalError(ctx);
    return;
  }

})
