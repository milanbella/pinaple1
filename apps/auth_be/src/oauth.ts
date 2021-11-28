import { IResponseError, ResponseErrorKind   } from 'pinaple_types/dist/http';
import { redirectWithErrorResponse } from './common';
import { apiUrl } from './common';
import { HttpError } from 'pinaple_www/dist/http';
import { httpGet, httpPost } from 'pinaple_www/dist/http';
import { Authorize, Session } from './types';
import { environment } from './environment';

const querystring = require('querystring');
const Router = require('@koa/router');

export const router = new Router();

const PROJECT = environment.appName;
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
          console.warn(`${PROJECT}:${FILE}:${FUNC}: no such client: ${clientId}`, err)
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

      console.error(`${PROJECT}:${FILE}:${FUNC}: error: ${err}`, err)
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
      (ctx.session.session as Session).authorize = authorize;
    } else {
      let session: Session = {
        authorize: authorize
      }
      ctx.session.session = session;
    }

    ctx.response.redirect('/login')

  } catch(err) {
    console.error(`${PROJECT}:${FILE}:${FUNC} error: ${err}`, err);
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

});

router.post('/token', async (ctx) => {
  const FUNC = 'router.post(/token)';
  try {
    let contentType = ctx.request.headers['content-type'];
    if (contentType !== 'application/x-www-form-urlencoded') {
      console.warn(`${PROJECT}:${FILE}:${FUNC} wrong content type: ${contentType}`);
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: 'wrong content type',
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    if (!ctx.request.body.grant_type) {
      console.warn(`${PROJECT}:${FILE}:${FUNC} missing grant_type`);
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: 'missing grant_type',
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    if (!ctx.request.body.code) {
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

    if (!ctx.request.body.redirect_uri) {
      console.warn(`${PROJECT}:${FILE}:${FUNC} missing redirect_uri`);
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: 'missing redirect_uri',
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    if (!ctx.request.body.client_id) {
      console.warn(`${PROJECT}:${FILE}:${FUNC} missing client_id`);
      let body: IResponseError = {
        errKind: ResponseErrorKind.BAD_REQUEST,
        data: {
          message: 'missing client_id',
        }
      };
      ctx.response.status = 400;
      ctx.response.body = body;
      return;
    }

    try {
      let hres = await httpPost(`${apiUrl()}/oauth/token/issue`, {
        grantType: ctx.request.body.grant_type,
        code: ctx.request.body.code, 
        redirectUri: ctx.request.body.redirect_uri, 
        clientId: ctx.request.body.client_id,
      });

      ctx.response.status = 200;
      ctx.response.body = {
        access_token: hres.accessToken,
        token_type: hres.tokenType,
        expires_in: hres.expiresIn, 
        refresh_token: hres.tokenType,
      }

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
    console.error(`${PROJECT}:${FILE}:${FUNC} error: ${err}`, err);
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

});

router.post('/api/authenticate', async (ctx) => {
  const FUNC = 'router.get(/api/authenticate)';
  try {
    let session: Session = ctx.session.session;
    if (!session) {
      console.warn(`${PROJECT}:${FILE}:${FUNC}: no session`)
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
      console.warn(`${PROJECT}:${FILE}:${FUNC}: session is missing 'authorize' attribute`)
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
      console.error(`${PROJECT}:${FILE}:${FUNC}: authorize object is missing 'clientId'`)
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
      console.error(`${PROJECT}:${FILE}:${FUNC}: authorize object is missing 'redirectUri'`)
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
      let hres = await httpPost(`${apiUrl()}/oauth/code/issue`, {
        clientId: authorize.clientId,
        userName: userName,
        password: password,
        redirectUri: authorize.redirectUri,
      });
      code = hres.code;
    } catch(err) {
      if (err instanceof HttpError && err.status === 401) {
        console.warn(`${PROJECT}:${FILE}:${FUNC}: unauthorized, userName: ${userName}`, err)
        let message = '';
        if (err.body.data.message === 'wrong user') {
          message = 'wrong user';
        } else if (err.body.data.message === 'wrong password') {
          message = 'wrong password';
        } else {
          message = 'unauthorized';
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
      console.error(`${PROJECT}:${FILE}:${FUNC}: http error: ${err}`, err)
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

    //ctx.response.redirect(`${authorize.redirectUri}?code=${code}`)
    ctx.response.status = 200;
    ctx.response.body = {
      redirectUri: `${authorize.redirectUri}?code=${code}` 
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

