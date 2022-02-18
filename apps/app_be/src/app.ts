import { environment } from './environment';
import { router as loginRouter } from './login';
import { router as registerRouter } from './register';

import * as fs from 'fs';
const path = require('path');
const https = require('https');

const Koa = require('koa');
const session = require('koa-generic-session');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');


const app = new Koa();
const router = new Router();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app.keys = ['uoagdjahddpkd665465kkjas#@@6654ddd'];

app.use(session());
app.use(bodyParser());

router.get('/', (ctx, next) => {
  ctx.body = 'Hello!\n';
});
router.get('/api', (ctx, next) => {
  ctx.body = 'Hello!\n';
});

app.use(router.routes())
  .use(router.allowedMethods())
  .use(loginRouter.routes())
  .use(registerRouter.routes())
;

const serverConfig = {
  port: environment.apiPort, 
  key: fs.readFileSync(path.resolve(process.cwd(), environment.sshKeyFilePath), 'utf8').toString(),
  cert: fs.readFileSync(path.resolve(process.cwd(), sshKeyCertPath), 'utf8').toString(),
}

const httpsServer = https.createServer(serverConfig, app.callback());
httpsServer.listen(environment.port, (err) => {
  if (err) {
    console.error('failed to create https server, error:', err);
  }
  console.log(`https server is listening on port ${environment.port}`); 
});
