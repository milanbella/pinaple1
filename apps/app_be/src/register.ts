import { IResponseError, ResponseErrorKind } from 'pinaple_types/dist/http';
import { environment } from './environment';
import { httpPost, HttpError } from 'pinaple_www/dist/http';
import { apiUrl } from './common';

const Router = require('@koa/router');
export const router = new Router();

const FILE = 'register.ts';


router.post('/api/register', async (ctx) => {
  const FUNC = 'router.post(/api/register)';
  try {
    let data = ctx.request.body;

    if (data.password !== data.passwordConfirm) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.WRONG_PARAMETR,
        data: {
          message: 'Heslá sa nezhodujú!'
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    let hres = await httpPost(`${apiUrl()}/user`, {
      userName: data.userName,
      email: data.email,
      password: data.password,
    });

    console.log(`@@@@@@@@@@@@@@@@@@@@ cp 1000`); //@@@@@@@@@@@@@@@@@@@@@@@@@@@
    console.dir(hres); //@@@@@@@@@@@@@@@@@@@@@@@@@

    ctx.response.status = 200;
    return;

  } catch(err) {
    console.log(`@@@@@@@@@@@@@@@@@@@@ cp 2000`); //@@@@@@@@@@@@@@@@@@@@@@@@@@@
    console.dir(err); //@@@@@@@@@@@@@@@@@@@@@@@@@
    if (err instanceof HttpError && err.status === 409) {
      let message, status, errKind;
      if (err.body.data.message === 'user name already exists') {
        message = 'Uživateľ s takým menom už existuje';
        status = 409;
        errKind = ResponseErrorKind.RESOURCE_EXISTS;
      } else if (err.body.data.message === 'user email already exists') {
        message = 'Uživateľ s takým emailom už existuje';
        status = 409;
        errKind = ResponseErrorKind.RESOURCE_EXISTS;
      } else {
        console.error(`${FILE}:${FUNC}: unknown message: ${err.body.data.message}`);
        status = 500;
        message = 'internal error';
        errKind = ResponseErrorKind.INTERNAL_ERROR;
      }

      let body: IResponseError = {
        errKind: errKind,
        data: {
          message: message
        }
      };
      ctx.response.status = status;
      ctx.response.body = body;
      return;
    } 

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
