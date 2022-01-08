import { environment } from './environment';
import { IResponseError } from 'pinaple_types/dist/http';

import { router as userRouter } from './user';
import { router as clientRouter } from './client';
import { router as oauthRouter } from './oauth';
import { router as adRouter } from './ad';

import * as fs from 'fs';
const path = require('path');
const https = require('https');

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');
const cors = require('@koa/cors');

const app = new Koa();
const router = new Router();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.use(bodyParser());

router.get('/', (ctx, next) => {
  ctx.body = 'Hello!\n';
});

app
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods())
  .use(userRouter.routes())
  .use(clientRouter.routes())
  .use(oauthRouter.routes())
  .use(adRouter.routes())
;


const serverConfig = {
  port: environment.apiPort, 
  key: fs.readFileSync(path.resolve(process.cwd(), 'key.pem'), 'utf8').toString(),
  cert: fs.readFileSync(path.resolve(process.cwd(), 'cert.pem'), 'utf8').toString(),
}

const httpsServer = https.createServer(serverConfig, app.callback());
httpsServer.listen(environment.apiPort, (err) => {
  if (err) {
    console.error('failed to create https server, error:', err);
  }
  console.log(`https server is listening on port ${environment.apiPort}`); 
});

