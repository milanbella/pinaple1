import { redirectWithErrorResponse } from './common';
import { errorResponse } from './common';
import { apiUrl } from './common';
import { HttpError } from 'www/dist/http';
import { httpGet } from 'www/dist/http';
import { Authorize, Session } from './types';

const Router = require('@koa/router');

const FILE = 'oauth.ts';

router.get('/authorize', async (ctx) => {
  const FUNC = 'router.get(/authorize)';
  try {
    if (!ctx.request.query.client_id) {
      errorResponse(ctx, 400,'missing required parameter \'client_id\'');
      return;
    }
    if (!ctx.request.query.response_type) {
      errorResponse(ctx, 400,'missing required parameter \'response_type\'');
      return;
    }
    if (ctx.request.query.response_type !== 'code') {
      errorResponse(ctx, 400,'parameter \'response_type\' has wrong value');
      return;
    }
    if (ctx.request.query.redirect_uri) {
      errorResponse(ctx, 400,'\'redirect_uri\' parameter is not supported');
      return;
    }
    if (ctx.request.query.scope) {
      errorResponse(ctx, 400,'\'scope\' parameter is not supported');
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
      if (err instanceof HttpError) {
        if (err.status === 404) {
          console.warn(`${FILE}:${FUNC}: no such client: ${clientId}`)
          errorResponse(ctx, 401);
          return;
        } else {
          console.error(`${FILE}:${FUNC}: http error: ${err}`, err)
          errorResponse(ctx, 500, 'internal error');
          return;
        }
      } else {
        console.error(`${FILE}:${FUNC}: http error: ${err}`, err)
        errorResponse(ctx, 500, 'internal error');
        return;
      }
    }

    let redirectUri = hres.redirectUri;


  } catch(err) {
    console.error(`${FILE}:${FUNC} error: ${err}`, err);
    errorResponse(ctx, 500,'internal error');
    return;
  }

})

router.get('/authenticate', async (ctx) => {
  const FUNC = 'router.get(/authenticate)';
  try {
    let session: Session = ctx.session;
    if (!session) {
      console.warn(`${FILE}:${FUNC}: no session`)
      ctx.response.status = 401;
      return;
    }
    if (!session.authorize) {
      console.warn(`${FILE}:${FUNC}: session is missing 'authorize' attribute`)
      ctx.response.status = 401;
      return;
    }
    let authorize = session.authorize;
    if (!authorize.clientId) {
      console.error(`${FILE}:${FUNC}: authorize object is missing 'clientId'`)
      ctx.response.status = 500;
      return;
    }
    if (!authorize.redirectUri) {
      console.error(`${FILE}:${FUNC}: authorize object is missing 'redirectUri'`)
      ctx.response.status = 500;
      return;
    }


  } catch(err) {
    console.error(`${FILE}:${FUNC} error: ${err}`, err);
    errorResponse(ctx, 500,'internal error');
    return;
  }

})
