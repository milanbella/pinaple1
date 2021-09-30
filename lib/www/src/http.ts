const fetch = require('node-fetch');

const FILE = 'http.ts'; 

interface Options {
  headers?: {
    [key: string]: string
  }
}

export async function httpGet<T> (url: string, options?: Options): Promise<T> {
  const FUNC = 'httpGet()';
  let response = await fetch(url);
  if (response.ok) {
    let body = await response.json();
    return body as T;
  } else {
    let text = '';
    try {
      text = await response.text();
    } catch(err) {
      console.error(`${FILE}:${FUNC}: error: ${url}: ${err}`, err)
    }
    console.error(`${FILE}:${FUNC}: error: ${url}: status: ${response.status}`);
    throw new Error(`error: ${url}: status: ${response.status}`);
  }
}

export async function httpPost<B, T> (url: string, body: B, options?: Options): Promise<T> {
  const FUNC = 'httpPost()';
  let response = await fetch(url, {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  });
  if (response.ok) {
    let body = await response.json();
    return body as T;
  } else {
    let text = '';
    try {
      text = await response.text();
    } catch(err) {
      console.error(`${FILE}:${FUNC}: error: ${url}: ${err}`, err)
    }
    console.error(`${FILE}:${FUNC}: error: ${url}: status: ${response.status}`);
    throw new Error(`error: ${url}: status: ${response.status}`);
  }
}
