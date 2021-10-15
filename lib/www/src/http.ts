const nodeFetch = require('node-fetch');
const R = require('ramda');

const FILE = 'http.ts'; 

export interface Options {
  query?: {
    [key: string]: string
  },
  headers?: {
    [key: string]: string
  }
}

interface HttpErrorData {
}

export class HttpError extends Error {
  status: number;
  jsonBody: any;
  constructor(status: number, jsonBody?: any) {
    super();
    this.status = status;
    this.jsonBody = jsonBody;
  }
}

function fetch() {
  return globalThis.fetch || nodeFetch; 
}

function getRequestOptions(options?: Options) {
  if (options) {
    return {
      query: options.query || undefined,
      headers: options.headers || undefined,
    };
  } else {
    return {};
  }
}

async function getJsonBody(response): Promise<any> {
  const FUNC = 'getJsonBody()';
  try {
    let text = await response.text();
    try {
      let body = JSON.parse(text);
      return body;
    } catch(err) {
      return text;
    }
  } catch(err) {
    console.error(`${FILE}:${FUNC}: error: ${err}`, err)
    return;
  }
}


export async function httpGet (url: string, options?: Options): Promise<any> {
  const FUNC = 'httpGet()';

  let roptions = getRequestOptions(options);
  let foptions = {
    headers: roptions.headers, 
  };

  let _url;
  if (roptions.query) {
    let q = R.compose(R.join('&'), R.map((pair) => `${pair[0]}=${encodeURIComponent(pair[1])}`), R.toPairs)(roptions.query);
    _url=`${url}?${q}`;
  } else {
    _url = url;
  }
  
  let response = await fetch()(_url, foptions);

  if (response.ok) {
    try {
      let body = await response.json();
      return body;
    } catch(err) {
      console.error(`${FILE}:${FUNC}: url: ${url}, response.json() failed, error: ${err}`, err);
      throw new HttpError(response.status, 'response.json() failed, error: ${err}');
    }
  } else {
    let body = await getJsonBody(response);
    console.error(`${FILE}:${FUNC}: url: ${url}, status: ${response.status}, body: ${JSON.stringify(body)}`);
    throw new HttpError(response.status, body);
  }
}

export async function httpPost (url: string, body: any, options?: Options): Promise<any> {
  const FUNC = 'httpPost()';

  let roptions = getRequestOptions(options);
  let foptions = {
    method: 'post',
    query: roptions.query, 
    headers: R.mergeLeft(roptions.headers || {}, {
      'Content-Type': 'application/json',
    }), 
    body: JSON.stringify(body),
  };

  let response = await fetch()(url, foptions);

  if (response.ok) {
    try {
      let body = await response.json();
      return body;
    } catch(err) {
      console.error(`${FILE}:${FUNC}: url: ${url}, response.json() failed, error: ${err}`, err);
      throw new HttpError(response.status, 'response.json() failed, error: ${err}');
    }
  } else {
    let body = await getJsonBody(response);
    console.error(`${FILE}:${FUNC}: url: ${url}, status: ${response.status}, body: ${JSON.stringify(body)}`);
    throw new HttpError(response.status, body);
  }
}

export async function httpDel (url: string, body: any, options?: Options): Promise<any> {
  const FUNC = 'httpPost()';

  let roptions = getRequestOptions(options);
  let foptions = {
    method: 'delete',
    query: roptions.query, 
    headers: R.mergeLeft(roptions.headers || {}, {
      'Content-Type': 'application/json',
    }), 
    body: JSON.stringify(body),
  };

  let response = await fetch()(url, foptions);

  if (response.ok) {
    try {
      let body = await response.json();
      return body;
    } catch(err) {
      console.error(`${FILE}:${FUNC}: url: ${url}, response.json() failed, error: ${err}`, err);
      throw new HttpError(response.status, 'response.json() failed, error: ${err}');
    }
  } else {
    let body = await getJsonBody(response);
    console.error(`${FILE}:${FUNC}: url: ${url}, status: ${response.status}, body: ${JSON.stringify(body)}`);
    throw new HttpError(response.status, body);
  }
}

/*
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
*/
