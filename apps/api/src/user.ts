import { IResponseError, ResponseErrorKind   } from 'types/dist/http';
import { query } from 'www/dist/pool';
import { validateSchema, hashString } from './common';

const Router = require('@koa/router');
const Ajv = require("ajv");
const { v1: uuidv1 } = require('uuid');

const FILE = 'user.ts';

const ajv = new Ajv();

export const router = new Router();

router.get('/user', async (ctx) => {
  const FUNC = 'router.post(/user/get)';
  try {

    let userName = ctx.request.query.user_name;

    if (!userName) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.WRONG_PARAMETR,
        data: {
          message: 'missing user_name query parameter',
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    let qres = await query('select id, user_name, email, password from users where user_name=$1', [ctx.request.body.userName]);  

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
      console.error(`${FILE}:${FUNC}: more then one user found`);
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
    ctx.response.body = {}

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
