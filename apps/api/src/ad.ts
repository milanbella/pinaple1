import { IResponseError, ResponseErrorKind   } from 'pinaple_types/dist/http';
import { initPool, query } from 'pinaple_www/dist/pool';
import { validateSchema, hashString } from './common';
import { environment } from './environment';

const Router = require('@koa/router');
const Ajv = require("ajv");
const { v1: uuidv1 } = require('uuid');

const PROJECT = environment.appName;
const FILE = 'user.ts';

const ajv = new Ajv();

export const router = new Router();

const schemaAdCreate = ajv.compile({
  type: "object",
  properties: {
    category: {type: "string"},
    sub_category: {type: "string"},
    text: {type: "string"},
    images: {
      type: "array",
      items: {
        type: "object",
        properties: {
          url: {type: "string"},
          image_type: {enum: ["original", "big", "thumb" ]}
        }
      }
    }

  },
  required: [
    "category",
    "sub_category",
    "text",
    "images"
  ],
  additionalProperties: false,
});
router.post('/ad', async (ctx) => {
  const FUNC = 'router.post(/ad)';

  if (!validateSchema(schemaAdCreate, ctx)) {
    return;
  }

  try {
    let inData = ctx.request.body;
  } catch(err) {
    console.error(`${PROJECT}:${FILE}:${FUNC} error: ${err}`, err);
    let body: IResponseError = {
      errKind: ResponseErrorKind.INTERNAL_ERROR,
      data: {
        message: 'internal error'
      }
    };
    ctx.response.status = 500;
    ctx.response.body = body;
    return;
  }


});
