import { environment } from './environment';
import { httpPost } from 'pinaple_www/dist/http';
import { IResponseError, ResponseErrorKind   } from 'pinaple_types/dist/http';

const Router = require('@koa/router');
export const router = new Router();

const FILE = 'login.ts';


router.get('/api/login', async (ctx) => {
  const FUNC = 'router.get(/api/login)';
  try {

    let url = `${environment.authProtocol}://${environment.authHost}:${environment.authPort}/authorize?request_type=code&client_id=${environment.oauthClientId}`

    ctx.response.redirect(url);


  } catch(err) {
    console.error(`${FILE}:${FUNC} error: ${err}`, err);
    ctx.response.status = 500;
    return;
  }

})

