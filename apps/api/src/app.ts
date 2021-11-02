import { environment } from './environment';
import { IResponseError } from 'pinaple_types/dist/http';

import { router as userRouter } from './user';
import { router as clientRouter } from './client';
import { router as oauthRouter } from './oauth';
import { initPool } from 'pinaple_www/dist/pool';

initPool(environment.pgUser, environment.pgHost, environment.pgDatabase, environment.pgPassword, environment.pgPort); 

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');


const app = new Koa();
const router = new Router();


app.use(bodyParser());

router.get('/', (ctx, next) => {
  ctx.body = 'Hello!';
});

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(userRouter.routes())
  .use(clientRouter.routes())
  .use(oauthRouter.routes())
;

app.listen(environment.apiPort);

