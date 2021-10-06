import { environment } from '../environment';
import { httpGet, httpPost, HttpError } from 'www/dist/http';
import { initPool, releasePool, query  } from 'www/dist/pool';

const fetch = require('node-fetch');

initPool(environment.pgUser, environment.pgHost, environment.pgDatabase, environment.pgPassword, environment.pgPort); 

let gRedirectUri = 'https://blablabla.foo.com';
let gClientId;
let gClientName = 'test_client';
let gUserName = 'johnDoe' ;
let gUserEmail = 'johndoe@foo.com' ;
let gPassword =  'bla';

function url() {
  return `${environment.apiProtocol}://${environment.apiHost}:${environment.apiPort}`;
}

async function cleanDb() {
  await query("delete from users where user_name = $1", [gUserName]);
  await query("delete from client where name = $1", [gClientName]);
  await query("delete from code where user_name = $1", [gUserName]);
  await query("delete from token where user_name = $1", [gUserName]);
}

beforeEach(async () => {
  try {
    await cleanDb();

    // create client
    let hres = await httpPost(`${url()}/client`, {
      redirectUri: gRedirectUri,
      name: gClientName, 
    });
    gClientId = hres.id;

    // create user
    let result = await httpPost(`${url()}/user`, {
      userName: gUserName,
      email: gUserEmail,
      password: gPassword,
    });
  } catch(err) {
    console.error(`@@@@@@@@@@@@@@@@@@@@ cleanUp failed: ${err}`, err);
    throw err;
  }

})

afterAll(() => {
  return releasePool();
});


test('Issue code using user_name.', async () => {
  let hres = await httpPost(`${url()}/oauth/code/issue`, {
    clientId: gClientId,
    userName: gUserName,
    password: gPassword,
  });
  expect(hres.code).toBeDefined();
})

test('Issue acces token.', async () => {
  let hres = await httpPost(`${url()}/oauth/code/issue`, {
    clientId: gClientId,
    userName: gUserName,
    password: gPassword,
  });
  expect(hres.code).toBeDefined();

  let code = hres.code;

  hres = await httpPost(`${url()}/oauth/token/issue`, {
    grantType: 'code',
    code: code,
    redirectUri: gRedirectUri,
    clientId: gClientId,
  });
})
