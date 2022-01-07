import { IResponseError, ResponseErrorKind   } from 'pinaple_types/dist/http';
import { initPool, query } from 'pinaple_www/dist/pool';
import { validateSchemaIn, hashString } from './common';
import { readKeyFromFs, importPrivateKey, importPublicKey, generateJWT, verifyJWT } from 'pinaple_www/dist/token';
import { environment } from './environment';

const Router = require('@koa/router');
const Ajv = require("ajv");
const { v4: uuidv4 } = require('uuid');
const { v1: uuidv1 } = require('uuid');

const PROJECT = environment.appName;
const FILE = 'oauth.ts';

const ajv = new Ajv();

const pool = initPool(environment.pgAuthUser, environment.pgAuthHost, environment.pgAuthDatabase, environment.pgAuthPassword, environment.pgAuthPort); 

export const router = new Router();

async function issueToken(clientId: string, userId: string, userName: string, userEmail: string): Promise<{
  accessToken: string;
  tokenType: string;
  refreshToken: string;
  expiresIn: string;
}> {
    const FUNC = 'issueToken()'; 
    try {
      // Issue acces and refresh token.

      let key = readKeyFromFs('certs/key-pkcs8.pem');
      let privateKey = await importPrivateKey(key);
      let expiresIn = '3600s';
      let jwt = await generateJWT(privateKey, expiresIn);

      let id = uuidv1();
      let access_token_hash = hashString(jwt);
      let refresh_token = uuidv4();
      let issued_at = new Date().toISOString();

      let sql = `insert into token(id, client_id, user_id, user_name, user_email, access_token_hash, refresh_token, issued_at) values ($1, $2, $3, $4, $5, $6, $7, $8)`;
      let params = [id, clientId, userId, userName, userEmail, access_token_hash, refresh_token, issued_at]
      await query(pool, sql, params);

      return {
        accessToken: `${jwt}`,
        tokenType: `Bearer`,
        refreshToken: `${refresh_token}`, 
        expiresIn: expiresIn,
      }
    } catch(err) {
      console.error(`${PROJECT}:${FILE}:${FUNC}: error: ${err}`, err);
      throw err;
    }
}

const schemaOauthCodeIssue = ajv.compile({
  type: 'object',
  properties: {
    clientId: {type: 'string'}, 
    userName: {type: 'string'},
    password: {type: 'string'},
    redirectUri: {type: 'string'}
  },
  required: [
    'clientId',
    'userName',
    'password'
  ],
  additionalProperties: false,
});
router.post('/oauth/code/issue', async (ctx) => {
  const FUNC = 'router.get(/oauth/code/issue)';
  try {
    if (!validateSchemaIn(schemaOauthCodeIssue, ctx)) {
      return;
    }

    // Verify client.
 
    let client_id, redirect_uri;
    let sql = 'select id, redirect_uri from client where id=$1';
    let params = [ctx.request.body.clientId];
    let qres = await query(pool, sql, params);
    if (qres.rows.length < 1) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.UNAUTHORIZED,
        data: {
          message: 'no such client_id'
        }
      };
      ctx.response.status = 401;
      ctx.response.body = body;
      return;
    } else if (qres.rows.length > 1) {
      console.error(`${PROJECT}:${FILE}:${FUNC}: client_id ${ctx.request.body.clientId} is not unique`)
      let body: IResponseError = {
        errKind: ResponseErrorKind.INTERNAL_ERROR,
        data: {
          message: 'client_id not unique'
        }
      };
      ctx.response.status = 500;
      return;
    } else {
      client_id = qres.rows[0].id;
      redirect_uri = qres.rows[0].redirect_uri;

      if (ctx.request.body.redirectUri && (redirect_uri !== ctx.request.body.redirectUri)) {
        let body: IResponseError = {
          errKind: ResponseErrorKind.UNAUTHORIZED,
          data: {
            message: 'wrong redirect_uri'
          }
        };
        ctx.response.status = 401;
        ctx.response.body = body;
        return;
      }
    }

    
    let  message;
    let user_id, user_name, email, password; 

    sql = 'select id, user_name, email,  password from users where user_name=$1';
    params = [ctx.request.body.userName];

    qres = await query(pool, sql, params);
    if (qres.rows.length < 1) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.UNAUTHORIZED,
        data: {
          message: 'wrong user',
        }
      };
      ctx.response.status = 401;
      ctx.response.body = body;
      return;
    } else if (qres.rows.length > 1) {
      console.error(`${PROJECT}:${FILE}:${FUNC}: user is not unique, userName: ${ctx.request.body.userName}`)
      let body: IResponseError = {
        errKind: ResponseErrorKind.INTERNAL_ERROR,
        data: {
          message: 'user is not unique'
        }
      };
      ctx.response.status = 500;
      ctx.response.body = body;
      return;
    } else {
      user_id = qres.rows[0].id;
      user_name = qres.rows[0].user_name;
      email = qres.rows[0].email;
      password = qres.rows[0].password;
    }

    // Verify if password match.

    if (password !== hashString(ctx.request.body.password)) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.UNAUTHORIZED,
        data: {
          message: 'wrong password'
        }
      };
      ctx.response.status = 401;
      ctx.response.body = body;
      return;
    }

    // Issue code token.

    let code = uuidv4();
    sql = 'insert into code(id, client_id, user_id, user_name, user_email, issued_at) values($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)';
    params = [code, client_id, user_id, user_name, email];
    qres = await query(pool, sql, params);

    ctx.response.status = 200;
    ctx.response.body = {
      code: code,
      redirectUri: ctx.request.body.redirectUri || redirect_uri,  
    }


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
    'clientId'
  ],
  additionalProperties: false,
});
router.post('/oauth/token/issue', async (ctx) => {
  const FUNC = 'router.get(/oauth/token/issue)';
  try {
    if (!validateSchemaIn(schemaOauthTokenIssue, ctx)) {
      return;
    }

    let grantType = ctx.request.body.grantType;
    if (grantType !== 'authorization_code') {
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: 'grantType must be \'authorization_code\''
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    // Verify client.

    let client_id, client_name, redirect_uri;
    let sql = 'select id, name, redirect_uri from client where id=$1';
    let params = [ctx.request.body.clientId];
    let qres = await query(pool, sql, params);
    if (qres.rows.length < 1) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.UNAUTHORIZED,
        data: {
          message: 'no such clientId'
        }
      };
      ctx.response.status = 401;
      ctx.response.body = body;
      return;
    } else if (qres.rows.length > 1) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.INTERNAL_ERROR,
        data: {
          message: 'clientId not unique'
        }
      };
      ctx.response.status = 500;
      ctx.response.body = body;
      return;
    } else {
      client_id = qres.rows[0].id;
      client_name = qres.rows[0].name;
      redirect_uri = qres.rows[0].redirect_uri;
    }

    // Verify redirect_uri.

    if (ctx.request.body.redirectUri && (ctx.request.body.redirectUri !== redirect_uri)) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.UNAUTHORIZED,
        data: {
          message: 'wrong redirectUri'
        }
      };
      ctx.response.status = 401;
      ctx.response.body = body;
      return;
    }

    // Verify code.

    let code = ctx.request.body.code;
    let id, user_id, user_name, user_email, issued_at;
    sql = 'select id, user_id, client_id, user_name, user_email, issued_at from code where id=$1  and client_id=$2';
    params = [code, client_id];
    qres = await query(pool, sql, params);
    if (qres.rows.length < 1) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.UNAUTHORIZED,
        data: {
          message: 'no such code'
        }
      };
      ctx.response.status = 401;
      ctx.response.body = body;
      return;
    } else if (qres.rows.length > 1) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.INTERNAL_ERROR,
        data: {
          message: 'code not unique'
        }
      };
      ctx.response.status = 500;
      ctx.response.body = body;
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

      // Invalidate code
      sql = 'delete from auth.code where id=$1';
      params = [id];
      await query(pool, sql, params);

      let body: IResponseError = {
        errKind: ResponseErrorKind.UNAUTHORIZED,
        data: {
          message: 'code expired'
        }
      };
      ctx.response.status = 401;
      ctx.response.body = body;
      return;
    }

    // Invalidate code
    sql = 'delete from auth.code where id=$1';
    params = [id];
    await query(pool, sql, params);

    // Issue access and refresh token.

    let res = await issueToken(client_id, user_id, user_name, user_email);

    ctx.response.status = 200;
    ctx.response.body = {
      accessToken: res.accessToken,
      tokenType: res.tokenType,
      refreshToken: res.refreshToken, 
      expiresIn: res.expiresIn,
    }

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

const schemaOauthTokenRefresh = ajv.compile({
  type: 'object',
  properties: {
    grantType: {type: 'string'}, 
    refreshToken: {type: 'string'}, 
  },
  required: [
    'grantType',
    'refreshToken',
  ],
  additionalProperties: false,
});
router.post('/oauth/token/refresh', async (ctx) => {
  const FUNC = 'router.get(/oauth/token/refresh)';
  try {
    if (!validateSchemaIn(schemaOauthTokenRefresh, ctx)) {
      return;
    }

    if (ctx.request.body.grantType !== 'refresh_token') {
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: 'grant_type must be \'refresh_token\''
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    let refreshToken = ctx.request.body.refreshToken;

    let sql = 'select id, client_id, user_id, user_name, user_email, issued_at from token where refresh_token=$1';
    let params = [refreshToken];
    let qres = await query(pool, sql, params);
    if (qres.rows.length < 1) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.UNAUTHORIZED,
        data: {
          message: 'inavlid refresh token'
        }
      };
      ctx.response.status = 401;
      ctx.response.body = body;
      return;
    } if (qres.rows.length > 1) {
      console.error(`${PROJECT}:${FILE}:${FUNC}: refresh token not unique`);
      let body: IResponseError = {
        errKind: ResponseErrorKind.INTERNAL_ERROR,
        data: {
          message: 'refresh token not unique'
        }
      };
      ctx.response.status = 500;
      ctx.response.body = body;
      return;
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

        sql = 'delete from token where refresh_token=$1';
        params = [refreshToken];
        await query(pool, sql, params);

        let body: IResponseError = {
          errKind: ResponseErrorKind.UNAUTHORIZED,
          data: {
            message: 'refresh_token expired'
          }
        };
        ctx.response.status = 401;
        ctx.response.body = body;
        return;
      }


      // Invalidate tokens

      sql = `delete from token where refresh_token=$1`;
      params = [refreshToken];
      await query(pool, sql, params);

      // Issue acces and refresh token.

      let res = await issueToken(client_id, user_id, user_name, user_email);

      ctx.response.status = 200;
      ctx.response.body = {
        accessToken: res.accessToken,
        tokenType: res.tokenType,
        refreshToken: res.refreshToken,
        expiresIn: res.expiresIn,
      }
    }

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

