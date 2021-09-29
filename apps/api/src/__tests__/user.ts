import { environment } from '../environment';

const fetch = require('node-fetch');

function url() {
  return `${environment.protocol}://${environment.host}:${environment.port}`;
}

test('Api is up and running', async () => {
  let response = await fetch(`${url()}/`);
  expect(response.ok).toEqual(true);
  let text = await response.text();
  expect(text.indexOf('Hello') > -1).toEqual(true);
})
