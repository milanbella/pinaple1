import { environment } from '../environment';
import {httpPost, httpDel } from 'www/dist/http';
import { initPool, releasePool, query  } from 'www/dist/pool';

const fetch = require('node-fetch');

initPool(environment.pgUser, environment.pgHost, environment.pgDatabase, environment.pgPassword, environment.pgPort); 

let gRedirectUri = 'https://blablabla.foo.com';

afterAll(() => {
  return releasePool();
});

function url() {
  return `${environment.apiProtocol}://${environment.apiHost}:${environment.apiPort}`;
}

async function cleanDb() {
  await query("delete from auth.client where redirect_uri=$1", [gRedirectUri]);
}

test('It creates and removes client', async () => {
  let hres = await httpPost(`${url()}/client`, {
    redirectUri: gRedirectUri
  });
  expect(hres.id).toBeDefined();
  let id = hres.id;
  let qres = await query("select count(*) as cnt from auth.client where id=$1", [id]);
  expect(qres.rows[0].cnt).toEqual('1');

  hres = await httpDel(`${url()}/client`, {
    id: id
  });
  qres = await query("select count(*) as cnt from auth.client where id=$1", [id]);
  expect(qres.rows[0].cnt).toEqual('0');
})
