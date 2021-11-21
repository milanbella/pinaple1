import { IResponseError, ResponseErrorKind   } from 'pinaple_types/dist/http';
import { query } from 'pinaple_www/dist/pool';
import { validateSchema, hashString } from './common';

const Router = require('@koa/router');
const Ajv = require("ajv");
const { v1: uuidv1 } = require('uuid');

const FILE = 'user.ts';

const ajv = new Ajv();

export const router = new Router();

router.get('/user', async (ctx) => {
  const FUNC = 'router.get(/user)';
  try {

    if (!(ctx.request.query.userName || ctx.request.query.userEmail)) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: `either 'userName' or 'userEmail' parameter has to be specified in query string`,
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    let userName = ctx.request.query.userName;
    let userEmail = ctx.request.query.userEmail;

    let sql, params;

    if (userName) {
      sql = 'select id, user_name, email, password from users where user_name=$1';
      params = [userName];
    } else if (userEmail) {
      sql = 'select id, user_name, email, password from users where email=$1';
      params = [userEmail];
    } else {
      throw new Error('assertion failed');
    }

    let qres = await query(sql, params);  

    if (qres.rows.length === 1) {
      let data = qres.rows[0];
      ctx.response.status = 200;
      ctx.response.body = {
        id: data.id,
        userName: data.user_name,
        userEmail: data.email,
        password: data.password,
      }
      return;
    } else if (qres.rows.length === 0) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.NOT_FOUND,
        data: {
          message: 'user not found'
        }
      };
      ctx.response.status = 404;
      ctx.response.body = body; 
      return;
    } else {
      console.error(`${FILE}:${FUNC}: more then one user found, userName: ${userName}, userEmail: ${userEmail}`);
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

});

const schemaUserCreate = ajv.compile({
  type: "object",
  properties: {
    userName: {type: "string"},
    email: {type: "string"},
    password: {type: "string"},
  },
  required: [
    "userName",
    "email",
    "password"
  ],
  additionalProperties: false,
});
router.post('/user', async (ctx) => {
  const FUNC = 'router.post(/user)';

  if (!validateSchema(schemaUserCreate, ctx)) {
    return;
  }
  let inData = ctx.request.body;

  try {

    // check if such a user already exists
    let qres = await query('select count(*) as cnt from users where user_name=$1', [inData.userName]);
    if (qres.rows[0].cnt > 0) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.RESOURCE_EXISTS,
        data: {
          message: 'user name already exists'
        }
      };
      ctx.response.status = 409;
      ctx.response.body = body; 
      return;
    }
    qres = await query('select count(*) as cnt from users where email=$1', [inData.email]);
    if (qres.rows[0].cnt > 0) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.RESOURCE_EXISTS,
        data: {
          message: 'user email already exists'
        }
      };
      ctx.response.status = 409;
      ctx.response.body = body; 
      return;
    }

    // create new user
    let id = uuidv1()
    let password = hashString(inData.password); 
    qres = await query('insert into users(id, user_name, email, password) values($1, $2, $3, $4)', [id, inData.userName, inData.email, password]);  

    ctx.response.status = 200;

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


});

const schemaUserDelete = ajv.compile({
  type: "object",
  properties: {
    userName: {type: "string"},
    email: {type: "string"},
  },
  additionalProperties: false,
});
router.del('/user', async (ctx) => {
  const FUNC = 'router.del(/user)';
  try {

    if (!validateSchema(schemaUserDelete, ctx)) {
      return;
    }

    let sql, params;
    if (ctx.request.body.userName) {
      if (ctx.request.body.email) {
        sql = 'delete from users where user_name=$1 or email=$2'
        params=[ctx.request.body.userName, ctx.request.body.email]
      } else {
        sql = 'delete from users where user_name=$1'
        params=[ctx.request.body.userName]
      }
    } else if (ctx.request.body.email) {
        sql = 'delete from users where email=$1'
        params=[ctx.request.body.email]
    } else {
      console.error(`${FILE}:${FUNC} error: either \'userName\' or \'email\' parameter mus be specified`);
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: 'either \'userName\' or \'email\' parameter mus be specified'
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    let qres = await query(sql, params);
    ctx.response.status = 200;
    return;

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
