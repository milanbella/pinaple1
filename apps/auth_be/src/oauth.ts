import { IResponseError, ResponseErrorKind   } from 'pinaple_types/dist/http';
import { redirectWithErrorResponse } from './common';
import { apiUrl } from './common';
import { HttpError } from 'pinaple_www/dist/http';
import { httpGet, httpPost } from 'pinaple_www/dist/http';
import { Authorize, Session } from './types';

const Router = require('@koa/router');
export const router = new Router();

const FILE = 'oauth.ts';

router.get('/authorize', async (ctx) => {
  const FUNC = 'router.get(/authorize)';
  try {
    if (!ctx.request.query.client_id) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: 'missing required parameter \'client_id\''
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }
    if (!ctx.request.query.response_type) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: 'missing required parameter \'response_type\''
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }
    if (ctx.request.query.response_type !== 'code') {
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: 'parameter \'response_type\' has wrong value'
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }
    if (ctx.request.query.redirect_uri) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: '\'redirect_uri\' parameter is not supported'
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }
    if (ctx.request.query.scope) {
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: '\'scope\' parameter is not supported'
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    let clientId = ctx.request.query.client_id; 
    let hres;
    try {
      hres = await httpGet(`${apiUrl()}/client`, {
        query: {
          clientId: clientId
        }
      });
    } catch(err) {
      if (err instanceof HttpError) {
        if (err.status === 404) {
          console.warn(`${FILE}:${FUNC}: no such client: ${clientId}`, err)
          let body: IResponseError = {
            errKind: ResponseErrorKind.UNAUTHORIZED,
            data: {
              message: 'no such client'
            }
          };
          ctx.response.status = 401;
          ctx.response.body = body;
          return;
        } 
      }

      console.error(`${FILE}:${FUNC}: http error: ${err}`, err)
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

    let authorize: Authorize = {
      clientId: hres.clientId,
      clientName: hres.name,
      redirectUri: hres.redirectUri,
    }

    if (ctx.session.session) {
      (ctx.session as Session).authorize = authorize;
    } else {
      let session: Session = {
        authorize: authorize
      }
      ctx.session = session;
    }

    ctx.response.redirect('/login')

  } catch(err) {
    console.error(`${FILE}:${FUNC} error: ${err}`, err);
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

router.get('/api/authenticate', async (ctx) => {
  const FUNC = 'router.get(/api/authenticate)';
  try {
    let session: Session = ctx.session;
    if (!session) {
      console.warn(`${FILE}:${FUNC}: no session`)
      let body: IResponseError = {
        errKind: ResponseErrorKind.UNAUTHORIZED,
        data: {
          message: 'unauthorized',
        }
      };
      ctx.response.status = 401;
      ctx.response.body = body;
      return;
    }
    if (!session.authorize) {
      console.warn(`${FILE}:${FUNC}: session is missing 'authorize' attribute`)
      let body: IResponseError = {
        errKind: ResponseErrorKind.UNAUTHORIZED,
        data: {
          message: 'unauthorized'
        }
      };
      ctx.response.status = 401;
      ctx.response.body = body;
      return;
    }
    let authorize = session.authorize;
    if (!authorize.clientId) {
      console.error(`${FILE}:${FUNC}: authorize object is missing 'clientId'`)
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
    if (!authorize.redirectUri) {
      console.error(`${FILE}:${FUNC}: authorize object is missing 'redirectUri'`)
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

    let userName = ctx.request.body.userName;
    let password = ctx.request.body.password;

    let code;
    try {
      let hres = await httpPost(`${apiUrl()}/code/issue`, {
        clientId: authorize.clientId,
        userName: userName,
        password: password,
        redirectUri: authorize.redirectUri,
      });
      code = hres.code;
    } catch(err) {
      if (err instanceof HttpError && err.status === 401) {
        console.warn(`${FILE}:${FUNC}: unathorized, userName: ${userName}`, err)
        let message = '';
        if (err.jsonBody.data && err.jsonBody.data.message === 'wrong user') {
          message = 'wrong user';
        }
        if (err.jsonBody.data && err.jsonBody.data.message === 'wrong password') {
          message = 'wrong password';
        }
        let body: IResponseError = {
          errKind: ResponseErrorKind.UNAUTHORIZED,
          data: {
            message: message
          }
        };
        ctx.response.status = 401;
        ctx.response.body = body;
        return;
      }
      console.error(`${FILE}:${FUNC}: http error: ${err}`, err)
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

    ctx.response.redirect(`${authorize.redirectUri}?code=${code}`)

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
