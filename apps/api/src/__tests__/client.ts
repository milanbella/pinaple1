import { environment } from '../environment';
import {httpPost, httpDelete, httpGet } from 'pinaple_www/dist/http';
import { initPool, releasePool, query  } from 'pinaple_www/dist/pool';

const fetch = require('node-fetch');

initPool(environment.pgUser, environment.pgHost, environment.pgDatabase, environment.pgPassword, environment.pgPort); 

let gClientName = 'test_client_for_client.ts';
let gRedirectUri = 'https://blablabla.foo.com';

async function cleanDb() {
  await query("delete from client where name = $1", [gClientName]);
}

beforeEach(async () => {
  await cleanDb();
})

afterAll(() => {
  return releasePool();
});

function url() {
  return `${environment.apiProtocol}://${environment.apiHost}:${environment.apiPort}`;
}

test('It creates and removes client by id', async () => {
  let hres = await httpPost(`${url()}/client`, {
    clientName: gClientName,
    redirectUri: gRedirectUri
  });
  expect(hres.id).toBeDefined();
  let id = hres.id;
  let qres = await query("select count(*) as cnt from auth.client where id=$1", [id]);
  expect(qres.rows[0].cnt).toEqual('1');

  hres = await httpDelete(`${url()}/client`, {
    clientId: id
  });
  qres = await query("select count(*) as cnt from auth.client where id=$1", [id]);
  expect(qres.rows[0].cnt).toEqual('0');
})

test('It creates and removes client by name', async () => {
  let hres = await httpPost(`${url()}/client`, {
    clientName: gClientName,
    redirectUri: gRedirectUri
  });
  expect(hres.id).toBeDefined();
  let id = hres.id;
  let qres = await query("select count(*) as cnt from auth.client where id=$1", [id]);
  expect(qres.rows[0].cnt).toEqual('1');

  hres = await httpDelete(`${url()}/client`, {
    clientName: gClientName
  });
  qres = await query("select count(*) as cnt from auth.client where id=$1", [id]);
  expect(qres.rows[0].cnt).toEqual('0');
})

test('It gets client by id', async () => {

  let hres = await httpPost(`${url()}/client`, {
    clientName: gClientName,
    redirectUri: gRedirectUri
  });

  expect(hres.id).toBeDefined();
  let clientId = hres.id;

  hres = await httpGet(`${url()}/client`, {
    query: {
      clientId: clientId
    }
  });

  expect(hres).toEqual({
    clientId: clientId,
    name: gClientName,
    redirectUri: gRedirectUri,
  });

})

test('It gets client by name', async () => {

  let hres = await httpPost(`${url()}/client`, {
    clientName: gClientName,
    redirectUri: gRedirectUri
  });

  expect(hres.id).toBeDefined();
  let clientId = hres.id;

  hres = await httpGet(`${url()}/client`, {
    query: {
      clientName: gClientName
    }
  });

  expect(hres).toEqual({
    clientId: clientId,
    name: gClientName,
    redirectUri: gRedirectUri,
  });

})
