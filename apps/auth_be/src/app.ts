const Koa = require('koa');
const session = require('koa-session');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');

const app = new Koa();
const router = new Router();

app.keys = ['uoagdjahddpkd665465kkjas#@@6654ddd'];

const CONFIG = {
  key: 'koa.sess', /** (string) cookie key (default is koa.sess) */
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 86400000,
  autoCommit: true, /** (boolean) automatically commit headers (default true) */
  overwrite: true, /** (boolean) can overwrite or not (default true) */
  httpOnly: true, /** (boolean) httpOnly or not (default true) */
  signed: true, /** (boolean) signed or not (default true) */
  rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
  renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
  secure: true, /** (boolean) secure cookie*/
  sameSite: null, /** (string) session cookie sameSite options (default null, don't set it) */
};

app.use(session(CONFIG, app));
app.use(bodyParser());

router.get('/', (ctx, next) => {
  ctx.body = 'Hello World';
});

app
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(3350);
