const Koa = require('koa');
const session = require('koa-generic-session');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');

import { environment } from './environment';
import { router as oauthRouter } from './oauth';

import * as fs from 'fs';
const path = require('path');
const https = require('https');

const app = new Koa();
const router = new Router();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.keys = ['uoagdjahddpkd665465kkjas#@@6654ddd'];

app.use(session({
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, //one day in ms
    overwrite: true,
    signed: true,
    sameSite: 'none',
    secure: true,
  }
}));
app.use(bodyParser());

router.get('/', (ctx, next) => {
  ctx.body = 'Hello!\n';
});

router.get('/api', (ctx, next) => {
  ctx.body = 'Hello!\n';
});

app.use(router.routes())
  .use(router.allowedMethods())
  .use(oauthRouter.routes());

const serverConfig = {
  port: environment.port, 
  key: fs.readFileSync(path.resolve(process.cwd(), environmnet.sshKeyFilePath), 'utf8').toString(),
  cert: fs.readFileSync(path.resolve(process.cwd(), environment.sshKeyCertPath), 'utf8').toString(),
}

const httpsServer = https.createServer(serverConfig, app.callback());
httpsServer.listen(environment.port, (err) => {
  if (err) {
    console.error('failed to create https server, error:', err);
  }
  console.log(`https server is listening on port ${environment.port}`); 
});
