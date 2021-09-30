import { environment } from './environment';
import { IResponseError } from 'types/dist/http';

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');


const app = new Koa();
const router = new Router();


app.use(bodyParser());

router.get('/', (ctx, next) => {
  ctx.body = 'Hello!';
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(environment.port);

