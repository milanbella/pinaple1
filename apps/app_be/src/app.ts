const Koa = require('koa');
const session = require('koa-generic-session');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');

import { environment } from './environment';
import { router as loginRouter } from './login';

const app = new Koa();
const router = new Router();

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
  .user(loginRouter);

app.listen(environment.port);
