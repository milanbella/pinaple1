import { redirectWithErrorResponse } from './common';
import { errorResponse } from './common';
import { apiUrl } from './common';
import { HttpError } from 'www/dist/http';
import { httpGet } from 'www/dist/http';

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
