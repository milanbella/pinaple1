import { IResponseError, ResponseErrorKind   } from 'types/dist/http';
import { query } from 'www/dist/pool';
import { validateSchema, hashString } from './common';
import { responseInternalError, responseBadRequest, responseOk, responseUnauthorized } from './common';
import { readKeyFromFs, importPrivateKey, importPublicKey, generateJWT, verifyJWT } from 'www/dist/token';
import { environment } from './environment';

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
    clientId: {type: 'string'}, 
    userName: {type: 'string'},
    email: {type: 'string'},
    password: {type: 'string'},
  },
  required: [
    'clientId',
    'password'
  ],
  additionalProperties: false,
});
router.post('/oauth/code/issue', async (ctx) => {
  const FUNC = 'router.get(/oauth/code/issue)';
  try {
    if (!validateSchema(schemaOauthCodeIssue, ctx)) {
      return;
    }

    // Verify client.
 
    let client_id, redirect_uri;
    let sql = 'select id, redirect_uri from client where id=$1';
    let params = [ctx.request.body.clientId];
    let qres = await query(sql, params);
    if (qres.rows.length < 1) {
      responseUnauthorized(ctx, 'no such client_id');
      return;
    } else if (qres.rows.length > 1) {
      console.error(`${FILE}:${FUNC}: client_id ${ctx.request.body.clientId} is not unique`)
      responseInternalError(ctx, 'client_id not unique');
      return;
    } else {
      client_id = qres.rows[0].id;
      redirect_uri = qres.rows[0].redirect_uri;
    }

    // Either username or email has to be specified.
    
    let  message;
    let user_id, user_name, email, password; 

    if (ctx.request.body.userName) {
      sql = "select id, user_name, email,  password from users where user_name=$1";
      params = [ctx.request.body.userName];
      message = "no such user name";
    } else if (ctx.request.body.email) {
      sql = "select id, user_name, email, password from users where email=$1";
      params = [ctx.request.body.email];
      message = "no such email";
    } else {
      responseBadRequest(ctx, 'either userName or email parameter has to be specified');
      return;
    }
    qres = await query(sql, params);
    if (qres.rows.length < 1) {
      responseUnauthorized(ctx, message);
      return;
    } else if (qres.rows.length > 1) {
      console.error(`${FILE}:${FUNC}: user is not unique, userName: ${ctx.request.body.userName}, email: ${ctx.request.body.email}`)
      responseInternalError(ctx, 'user is not unique');
    } else {
      user_id = qres.rows[0].id;
      user_name = qres.rows[0].user_name;
      email = qres.rows[0].email;
      password = qres.rows[0].password;
    }


    // Verify if password match.

    if (password !== hashString(ctx.request.body.password)) {
      responseUnauthorized(ctx, message);
      return;
    }

    // Issue code token.

    let code = uuidv4();
    sql = 'insert into code(id, client_id, user_id, user_name, user_email, issued_at) values($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)';
    params = [code, client_id, user_id, user_name, email];
    qres = await query(sql, params);

    ctx.response.status = 200;
    ctx.response.body = {
      code: code
    }


  } catch(err) {
    console.error(`${FILE}:${FUNC} error: ${err}`, err);
    responseInternalError(ctx);
    return;
  }

})

const schemaOauthTokenIssue = ajv.compile({
  type: 'object',
  properties: {
    grantType: {type: 'string'}, 
    code: {type: 'string'}, 
    redirectUri: {type: 'string'}, 
    clientId: {type: 'string'},
  },
  required: [
    'grantType',
    'code',
    'redirectUri',
    'clientId'
  ],
  additionalProperties: false,
});
router.post('/oauth/token/issue', async (ctx) => {
  const FUNC = 'router.get(/oauth/token/issue)';
  try {
    if (!validateSchema(schemaOauthTokenIssue, ctx)) {
      return;
    }

    let grantType = ctx.request.body.grantType;
    if (grantType !== 'code') {
      responseBadRequest(ctx, 'grantType must be \'code\'');
      return;
    }

    // Verify client.

    let client_id, client_name, redirect_uri;
    let sql = 'select id, name, redirect_uri from client where id=$1';
    let params = [ctx.request.body.clientId];
    let qres = await query(sql, params);
    if (qres.rows.length < 1) {
      responseUnauthorized(ctx, 'no such clientId');
      return;
    } else if (qres.rows.length > 1) {
      responseInternalError(ctx, 'clientId not unique');
      return;
    } else {
      client_id = qres.rows[0].id;
      client_name = qres.rows[0].name;
      redirect_uri = qres.rows[0].redirect_uri;
    }

    // Verify redirect_uri.

    if (ctx.request.body.redirectUri !== redirect_uri) {
      responseUnauthorized(ctx, 'unknown redirectUri');
      return;
    }

    // Verify code.

    let code = ctx.request.body.code;
    let id, user_id, user_name, user_email, issued_at;
    sql = 'select id, user_id, client_id, user_name, user_email, issued_at from code where id=$1  and client_id=$2';
    params = [code, client_id];
    qres = await query(sql, params);
    if (qres.rows.length < 1) {
      responseUnauthorized(ctx, 'no such code');
      return;
    } else if (qres.rows.length > 1) {
      responseInternalError(ctx, 'code not unique');
      return;
    } else {
      id = qres.rows[0].id;
      user_id = qres.rows[0].user_id;
      user_name = qres.rows[0].user_name;
      user_email = qres.rows[0].user_email;
      issued_at = qres.rows[0].issued_at;
    }

    let issuedAtMs = new Date(issued_at).getTime();
    let currentMs = new Date().getTime();
    let validityMs = environment.codeTokenValiditySeconds * 1000;
    if (currentMs - issuedAtMs > validityMs) {
      // expired refresh toke
      responseUnauthorized(ctx, 'code expired');

      sql = 'delete from auth.code where id=$1';
      params = [id];
      await query(ctx, params);

      return;
    }

    // Issue acces and refresh token.

    let key = readKeyFromFs('certs/key-pkcs8.pem');
    let privateKey = await importPrivateKey(key);
    let expiresIn = '3600s';
    let jwt = await generateJWT(privateKey, expiresIn);

    id = uuidv1();
    let access_token_hash = hashString(jwt);
    let refresh_token = uuidv4();
    issued_at = new Date().toISOString();

    sql = `insert into token(id, client_id, user_id, user_name, user_email, access_token_hash, refresh_token, issued_at) values ($1, $2, $3, $4, $5, $6, $7, $8)`;
    params = [id, client_id, user_id, user_name, user_email, access_token_hash, refresh_token, issued_at]
    await query(sql, params);

    ctx.response.status = 200;
    ctx.response.body = {
      access_token: `$jwt`,
      token_type: `Bearer`,
      refresh_token: `${refresh_token}`, 
      expires_in: expiresIn,
    }

  } catch(err) {
    console.error(`${FILE}:${FUNC} error: ${err}`, err);
    responseInternalError(ctx);
    return;
  }

})

const schemaOauthTokenRefresh = ajv.compile({
  type: 'object',
  properties: {
    grant_type: {type: 'string'}, 
    c: {type: 'string'}, 
    redirect_uri: {type: 'string'}, 
    client_id: {type: 'string'},
  },
  required: [
    'grant_type',
    'refresh_token',
  ],
  additionalProperties: false,
});
router.get('/oauth/token/refresh', async (ctx) => {
  const FUNC = 'router.get(/oauth/token/refresh)';
  try {
    if (!validateSchema(schemaOauthCodeIssue, ctx)) {
      return;
    }

    if (ctx.request.body.grant_type !== 'refresh_token') {
      responseBadRequest(ctx, 'grant_type must be \'refresh_token\'');
      return;
    }

    let refresh_token = ctx.request.body.refresh_token;

    let sql = 'select id, client_id, user_id, user_name, user_email, issued_at, from token where refresh_token=$1';
    let params = [refresh_token];
    let qres = await query(sql, params);
    if (qres.rows.length < 1) {
      responseUnauthorized(ctx, 'inavlid refresh token');
      return;
    } if (qres.rows.length > 1) {
      console.error(`${FILE}:${FUNC}: refresh token not unique`);
      responseInternalError(ctx, 'refresh token not unique');
    } else {

      let id = qres.rows[0].id;
      let client_id = qres.rows[0].client_id;
      let user_id = qres.rows[0].user_id;
      let user_name = qres.rows[0].user_name;
      let user_email = qres.rows[0].user_email;
      let issued_at = qres.rows[0].issued_at;

      // Check refresh token validity time

      let issuedAtMs = new Date(issued_at).getTime();
      let currentMs = new Date().getTime();
      let validityMs = environment.refreshTokenValidityHours * 3600 * 1000;
      if (currentMs - issuedAtMs > validityMs) {
        // expired refresh toke
        responseUnauthorized(ctx, 'refresh_token expired');

        sql = 'delete from token where refresh_token=$1';
        params = [refresh_token];
        await query(ctx, params);

        return;
      }

      // Invalidate tokens

      sql = `delete from token where refresh_token=$1`;
      params = [refresh_token];
      await query(sql, params);

      // Issue acces and refresh token.

      let key = readKeyFromFs('certs/key-pkcs8.pem');
      let privateKey = await importPrivateKey(key);
      let expiresIn = '3600s';
      let jwt = await generateJWT(privateKey, expiresIn);

      id = uuidv1();
      let access_token_hash = hashString(jwt);
      refresh_token = uuidv4();

      sql = `insert into token(id, client_id, user_id, user_name, user_email, access_token_hash, refresh_token) values ($1, $2, $3, $4, $5)`;
      params = [id, client_id, user_id, user_name, user_email, access_token_hash, refresh_token]
      await query(sql, params);

      ctx.response.status = 200;
      ctx.response.body = {
        access_token: `$jwt`,
        token_type: `Bearer`,
        refresh_token: `${refresh_token}`, 
        expires_in: expiresIn,
      }
    }

  } catch(err) {
    console.error(`${FILE}:${FUNC} error: ${err}`, err);
    responseInternalError(ctx);
    return;
  }

})

