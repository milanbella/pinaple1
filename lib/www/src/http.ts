const fetch = require('node-fetch');
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
  try {
      let body = await response.json();
      return body;
  } catch(err) {
      let text = await response.text();
      try {
        let body = JSON.parse(text);
        return body;
      } catch(err) {
        return {};
      }
  }
}


export async function httpGet (url: string, options?: Options): Promise<any> {
  const FUNC = 'httpGet()';

  let roptions = getRequestOptions(options);
  let foptions = {
    query: roptions.query, 
    headers: roptions.headers, 
  };

  let response = await fetch(url, foptions);

  if (response.ok) {
    let body = await response.json();
    return body;
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

  let response = await fetch(url, foptions);

  if (response.ok) {
    let body = await response.json();
    return body;
  } else {
    let body = await getJsonBody(response);
    console.error(`${FILE}:${FUNC}: url: ${url}, status: ${response.status}, body: ${JSON.stringify(body)}`);
    throw new HttpError(response.status, body);
  }
}
