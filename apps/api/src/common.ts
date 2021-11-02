import { IResponseError, ResponseErrorKind   } from 'pinaple_types/dist/http';

const SHA256 = require("crypto-js/sha256");

export function validateSchema(schema, ctx): boolean {
  const valid = schema(ctx.request.body);
  if (!valid) {
    let body: IResponseError = {
      errKind: ResponseErrorKind.JSON_SCHEMA_VALIDATION,
      data: schema.errors,
    };
    ctx.response.status = 400;
    ctx.response.body = body; 
    return false;
  }
  return true;
}

export function hashString(str: string): string {
  let s = SHA256(str).toString(); 
  return s;
}
