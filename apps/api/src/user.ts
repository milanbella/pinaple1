const Router = require('@koa/router');
const router = new Router();
const Ajv = require("ajv");

const ajv = new Ajv();

router.get('/user', (ctx, next) => {
  ctx.body = 'Hello!';
});

const schemaUserGet = ajv.compile({
  type: "object",
  properties: {
    userName: {type: "string"},
  },
  required: ["userName"],
  additionalProperties: false,
});
router.get('/user/get', (ctx) => {
  const valid = schemaUserGet(ctx.request.body);
  if (!valid) {
    ctx.response.status = 400;
    ctx.response.body = valid.errors;
    return;
  }
});
