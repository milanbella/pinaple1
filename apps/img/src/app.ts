const Koa = require('koa');

import { environment } from './environment';

import * as fs from 'fs';
const path = require('path');
const https = require('https');

import { router } from './router';

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = new Koa();

app.use(router.routes());
app.use(router.allowedMethods());

const serverConfig = {
  port: environment.port, 
  key: fs.readFileSync(path.resolve(process.cwd(), 'key.pem'), 'utf8').toString(),
  cert: fs.readFileSync(path.resolve(process.cwd(), 'cert.pem'), 'utf8').toString(),
}

const httpsServer = https.createServer(serverConfig, app.callback());
httpsServer.listen(environment.port, (err) => {
  if (err) {
    console.error('failed to create https server, error:', err);
  }
  console.log(`https server is listening on port ${environment.port}`); 
});
