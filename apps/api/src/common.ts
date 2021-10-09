import { IResponseError, ResponseErrorKind   } from 'types/dist/http';

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

export function responseUnauthorized(ctx, message?) {
  let data;
  if (message) {
    data = {
      message: message
    }
  } else {
    data = {};
  }

  let body: IResponseError = {
    errKind: ResponseErrorKind.UNAUTHORIZED,
    data: data
  };
  ctx.response.status = 401;
  ctx.response.body = body;
}

export function responseNotFound(ctx, message?) {
  let data;
  if (message) {
    data = {
      message: message
    }
  } else {
    data = {};
  }

  let body: IResponseError = {
    errKind: ResponseErrorKind.UNAUTHORIZED,
    data: data
  };
  ctx.response.status = 404;
  ctx.response.body = body;
}

export function responseInternalError(ctx, message?) {
  let data;
  if (message) {
    data = {
      message: message
    }
  } else {
    data = {};
  }

  let body: IResponseError = {
    errKind: ResponseErrorKind.INTERNAL_ERROR,
    data: data
  };
  ctx.response.status = 500;
  ctx.response.body = body;
}


export function responseOk(ctx, body?) {
  ctx.response.status = 500;
  if (body) {
    ctx.response.body = body;
  }
}

export function responseBadRequest(ctx, message?) {
  let data;
  if (message) {
    data = {
      message: message
    }
  } else {
    data = {};
  }

  let body: IResponseError = {
    errKind: ResponseErrorKind.BAD_REQUEST,
    data: data
  };
  ctx.response.status = 400;
  ctx.response.body = body;
}

export function hashString(str: string): string {
  let s = SHA256(str).toString(); 
  return s;
}
