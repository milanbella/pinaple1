const Koa = require('koa');
const session = require('koa-generic-session');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');
const { environment } = require('./environment')

const app = new Koa();
const router = new Router();

app.keys = ['uoagdjahddpkd665465kkjas#@@6654ddd'];

app.use(session());
app.use(bodyParser());

router.get('/', (ctx, next) => {
  ctx.body = 'Hello!';
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(environment.port);
