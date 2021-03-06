import { environment } from './environment'; 
import { authUrl } from './common';
import { httpPost } from 'pinaple_www/dist/http';
import { IResponseError, ResponseErrorKind   } from 'pinaple_types/dist/http';
import { HttpError } from 'pinaple_www/dist/http';

const Router = require('@koa/router');
export const router = new Router();

const PROJECT = environment.appName;
const FILE = 'login.ts';

function redirectUri() {
  let url =`${environment.authProtocol}://${environment.authHost}${environment.authPort === 80 ? '' : ':' + environment.authPort}/authorize?response_type=code&client_id=${environment.oauthClientId}`;
  return url;
}


router.get('/api/login', async (ctx) => {
  const FUNC = 'router.get(/api/login)';
  try {
    let url = redirectUri();

    ctx.response.redirect(url);

  } catch(err) {
    console.error(`${PROJECT}:${FILE}:${FUNC} missing grant_type`);
    let body: IResponseError = {
      errKind: ResponseErrorKind.INTERNAL_ERROR,
      data: {
        message: 'internal error',
      }
    };
    ctx.response.status = 500;
    ctx.response.body = body;
    return;
  }

})

router.get('/api/token', async (ctx) => {
  const FUNC = 'router.get(/api/token)';
  try {

    let code = ctx.request.query.code;
    if (!code) {
      console.warn(`${PROJECT}:${FILE}:${FUNC} missing code`);
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: 'missing code',
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    try {
      let query = `grant_type=authorization_code&code=${code}&client_id=${environment.oauthClientId}`;
      let hres = await httpPost(`${authUrl()}/token/`, query, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ logged in');
      console.dir(hres); // @@@@@@@@@@@@@@@@@@@@@@@@

      ctx.response.redirect('/');


    } catch(err) {
      if (err instanceof HttpError) {
          console.warn(`${PROJECT}:${FILE}:${FUNC}: http error: `, err)
          let body: IResponseError = {
            errKind: err.body.errKind,
            data: {
              message: err.body.data.message,
              value: err.body.data.value,
            }
          };
          ctx.response.status = err.status;
          ctx.response.body = body;
          return;
        } 

        console.error(`${PROJECT}:${FILE}:${FUNC} httpPost() error:`, err);
        let body: IResponseError = {
          errKind: ResponseErrorKind.INTERNAL_ERROR,
          data: {
            message: 'internal error',
          }
        };
        ctx.response.status = 500;
        ctx.response.body = body;
        return;
    }

  } catch(err) {
    console.error(`${PROJECT}:${FILE}:${FUNC} error`, err);
    let body: IResponseError = {
      errKind: ResponseErrorKind.INTERNAL_ERROR,
      data: {
        message: 'internal error',
      }
    };
    ctx.response.status = 500;
    ctx.response.body = body;
    return;
  }

})

