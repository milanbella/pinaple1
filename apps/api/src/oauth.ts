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

    // Verify client.
 
    let client_id, redirect_uri;
    let sql = 'select client_id, redirect_uri from oauth_client where client_id=$1';
    let params = [ctx.request.body.client_id];
    let qres = await query(sql, params);
    if (qres.rows.length < 1) {
      responseUnauthorized(ctx, 'no such client_id');
      return;
    } else if (qres.rows.length > 1) {
      console.error(`${FILE}:${FUNC}: client_id ${ctx.request.body.client_id} is not unique`)
      responseInternalError(ctx, 'client_id not unique');
      return;
    } else {
      client_id = qres.rows[0].client_id;
      redirect_uri = qres.rows[0].redirect_uri;
    }

    // Either username or email has to be specified.
    
    let  message;
    let userName = ctx.request.body.userName;
    let email = ctx.request.body.email;
    let user_id, password; 

    if (userName) {
      sql = "select user_id, password from users where user_name=$1";
      params = [userName];
      message = "no such user name";
    } else if (email) {
      sql = "select user_id, password from users where email=$1";
      params = [email];
      message = "no such email";
    } else {
      responseBadRequest(ctx, 'either user_name or email parameter has to be specified');
      return;
    }
    qres = await query(sql, params);
    if (qres.rows.length < 1) {
      responseUnauthorized(ctx, message);
      return;
    } else if (qres.rows.length > 1) {
      console.error(`${FILE}:${FUNC}: user is not unique, user_name: ${userName}, email: ${email}`)
      responseInternalError(ctx, 'user is not unique');
    } else {
      user_id = qres.rows[0].user_id;
      password = qres.rows[0].password;
    }


    // Verify if password match.

    if (password !== hashString(ctx.request.body.password)) {
      responseUnauthorized(ctx, message);
      return;
    }

    // Issue code token.

    let code = uuidv4();
    sql = 'insert into oauth_code(id, client_id, user_id, user_name, user_email, issued_at) values($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)';
    params = [code, client_id, user_id, userName, email];
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

    // Verify client.

    let client_id, redirect_uri;
    let sql = 'select client_id, redirect_uri from oauth_client where client_id=$1';
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

    // Verify redirect_uri.

    if (ctx.request.body.redirect_uri !== redirect_uri) {
      responseUnauthorized(ctx, 'unknown redirect_uri');
      return;
    }

    // Verify code.

    let code = ctx.request.body.code;
    let id, user_id, user_name, user_email, issued_at;
    sql = 'select id, user_id, user_name, user_email, client_id, issued_at from oauth_code_token where id=$1  and client_id=$2';
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

      sql = 'delete from auth.oauth_code_token where id=$1';
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

    sql = `insert into oauth_access_token(id, client_id, user_id, user_name, user_emaia,l access_token_hash, refresh_token) values ($1, $2, $3, $4, $5)`;
    params = [id, client_id, user_id, user_name, user_email, access_token_hash, refresh_token]
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

    let sql = 'select id, client_id, user_id, user_name, user_email, issued_at, from oauth_access_token where refresh_token=$1';
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

        sql = 'delete from oauth_access_token where refresh_token=$1';
        params = [refresh_token];
        await query(ctx, params);

        return;
      }

      // Invalidate tokens

      sql = `delete from oauth_access_token where refresh_token=$1`;
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

      sql = `insert into oauth_access_token(id, client_id, user_id, user_name, user_email, access_token_hash, refresh_token) values ($1, $2, $3, $4, $5)`;
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

