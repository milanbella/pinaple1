import { IResponseError, ResponseErrorKind } from 'pinaple_types/dist/http';

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
  mode?: 'same-origin' | 'no-cors' | 'cors' | 'navigate' | 'websocket'
}

interface HttpErrorData {
}


export class HttpError extends Error {
  status: number;
  body: IResponseError; 
  constructor(status: number, body?: any) {
    super();
    this.name = 'HttpError';
    this.status = status;
    let _body: IResponseError;
    if (body.hasOwnProperty && body.hasOwnProperty('errKind') && body.hasOwnProperty('data') && body.data.hasOwnProperty && body.data.hasOwnProperty('message')) {
      _body = {
        errKind: body.errKind,
        data: body.data,
      }
    } else {
     _body = {
        errKind: ResponseErrorKind.INTERNAL_ERROR,
        data: {
          message: 'internal error',
          value: body,
        }
      }
    }
    this.body = _body;
  }
}

function fetch() {
  return globalThis.fetch || nodeFetch; 
}

function getRequestOptions(options?: Options) {
  return R.mergeRight(options, {});
}

function appendQueryToUrl(url, options: Options) {
  let _url;
  if (options.query) {
    let q = R.compose(R.join('&'), R.map((pair) => `${pair[0]}=${encodeURIComponent(pair[1])}`), R.toPairs)(options.query);
    _url=`${url}?${q}`;
  } else {
    _url = url;
  }
  return _url;
}

async function getBody(response): Promise<any> {
  const FUNC = 'getBody()';
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
    mode: roptions.mode,
  };

  let _url = appendQueryToUrl(url, roptions);
  
  let response;
  try {
    response = await fetch()(_url, foptions);
  } catch(err) {
    console.error(`${FILE}:${FUNC}: fetch() failed, url: ${url}`, err);
    throw new HttpError(0, '');
  }

  if (response.ok) {
    try {
      let body = await getBody(response);
      return body;
    } catch(err) {
      console.error(`${FILE}:${FUNC}: url: ${url}, response.json() failed, error: ${err}`, err);
      throw new HttpError(response.status, 'response.json() failed, error: ${err}');
    }
  } else {
    let body = await getBody(response);
    console.error(`${FILE}:${FUNC}: url: ${url}, status: ${response.status}, body: ${JSON.stringify(body)}`);
    throw new HttpError(response.status, body);
  }
}

export async function httpPost (url: string, body: any, options?: Options): Promise<any> {
  const FUNC = 'httpPost()';

  let roptions = getRequestOptions(options);
  let foptions = {
    method: 'post',
    headers: R.mergeLeft(roptions.headers || {}, {
      'Content-Type': 'application/json',
    }), 
    mode: roptions.mode,
    body: JSON.stringify(body),
  };

  let _url = appendQueryToUrl(url, roptions);

  let response;
  try {
    response = await fetch()(_url, foptions);
  } catch(err) {
    console.error(`${FILE}:${FUNC}: fetch() failed, url: ${url}`, err); 
    throw new HttpError(0, '');
  }

  if (response.ok) {
    try {
      let body = await getBody(response);
      return body;
    } catch(err) {
      console.error(`${FILE}:${FUNC}: url: ${url}, response.json() failed, error: ${err}`, err);
      throw new HttpError(response.status, 'response.json() failed, error: ${err}');
    }
  } else {
    let body = await getBody(response);
    console.error(`${FILE}:${FUNC}: url: ${url}, status: ${response.status}, body: ${JSON.stringify(body)}`);
    let err = new HttpError(response.status, body);
    throw err;
  }
}

export async function httpDelete (url: string, body: any, options?: Options): Promise<any> {
  const FUNC = 'httpPost()';

  let roptions = getRequestOptions(options);
  let foptions = {
    method: 'delete',
    headers: R.mergeLeft(roptions.headers || {}, {
      'Content-Type': 'application/json',
    }), 
    mode: roptions.mode,
    body: JSON.stringify(body),
  };

  let _url = appendQueryToUrl(url, roptions);

  let response;
  try {
    response = await fetch()(_url, foptions);
  } catch(err) {
    console.error(`${FILE}:${FUNC}: fetch() failed, url: ${url}`, err); 
    throw new HttpError(0, '');
  }

  if (response.ok) {
    try {
      let body = await getBody(response);
      return body;
    } catch(err) {
      console.error(`${FILE}:${FUNC}: url: ${url}, response.json() failed, error: ${err}`, err);
      throw new HttpError(response.status, 'response.json() failed, error: ${err}');
    }
  } else {
    let body = await getBody(response);
    console.error(`${FILE}:${FUNC}: url: ${url}, status: ${response.status}, body: ${JSON.stringify(body)}`);
    throw new HttpError(response.status, body);
  }
}
