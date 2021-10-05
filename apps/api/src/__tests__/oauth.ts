import { environment } from '../environment';
import { httpGet, httpPost, HttpError } from 'www/dist/http';
import { initPool, releasePool, query  } from 'www/dist/pool';

const fetch = require('node-fetch');

initPool(environment.pgUser, environment.pgHost, environment.pgDatabase, environment.pgPassword, environment.pgPort); 

afterAll(() => {
  return releasePool();
});

function url() {
  return `${environment.apiProtocol}://${environment.apiHost}:${environment.apiPort}`;
}

test('Issue code.', async () => {
})

