import { environment } from '../environment';
import { httpGet, httpPost, HttpError } from 'pinaple_www/dist/http';
import { initPool, releasePool, query  } from 'pinaple_www/dist/pool';

const fetch = require('node-fetch');

initPool(environment.pgUser, environment.pgHost, environment.pgDatabase, environment.pgPassword, environment.pgPort); 

let gRedirectUri = 'https://blablabla.foo.com';
let gClientId;
let gClientName = 'test_client_for_oauth.ts';
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

})

afterAll(() => {
  return releasePool();
});


test('Issue code using user_name.', async () => {
  let hres = await httpPost(`${url()}/oauth/code/issue`, {
    clientId: gClientId,
    userName: gUserName,
    password: gPassword,
    redirectUri: gRedirectUri,
  });
  expect(hres.code).toBeDefined();
})

test('Do not issue code using wrong user_name.', async () => {
  try {
    let hres = await httpPost(`${url()}/oauth/code/issue`, {
      clientId: gClientId,
      userName: gUserName + 'xxxx',
      password: gPassword,
      redirectUri: gRedirectUri,
    });
    expect(true).toBe(false);
  } catch(err) {
    expect(err instanceof HttpError).toBe(true);
    expect(err.status).toBe(401);
    expect(err.jsonBody).toEqual({ errKind: 'UNAUTHORIZED', data: { message: 'wrong user' } });
  }
})

test('Do not issue code using wrong password.', async () => {
  try {
    let hres = await httpPost(`${url()}/oauth/code/issue`, {
      clientId: gClientId,
      userName: gUserName,
      password: gPassword + 'xxx',
      redirectUri: gRedirectUri,
    });
    expect(true).toBe(false);
  } catch(err) {
    expect(err instanceof HttpError).toBe(true);
    expect(err.status).toBe(401);
    expect(err.jsonBody).toEqual({ errKind: 'UNAUTHORIZED', data: { message: 'wrong password' } });
  }
})

test('Do not issue code using wrong client_id.', async () => {
  try {
    let hres = await httpPost(`${url()}/oauth/code/issue`, {
      clientId: gClientId + 'xxx',
      userName: gUserName,
      password: gPassword,
      redirectUri: gRedirectUri,
    });
    expect(true).toBe(false);
  } catch(err) {
    expect(err instanceof HttpError).toBe(true);
    expect(err.status).toBe(401);
    expect(err.jsonBody).toEqual({ errKind: 'UNAUTHORIZED', data: { message: 'no such client_id' } });
  }
})

test('Do not issue code using wrong redirect_uri.', async () => {
  try {
    let hres = await httpPost(`${url()}/oauth/code/issue`, {
      clientId: gClientId,
      userName: gUserName,
      password: gPassword,
      redirectUri: gRedirectUri + 'xxx',
    });
    expect(true).toBe(false);
  } catch(err) {
    expect(err instanceof HttpError).toBe(true);
    expect(err.status).toBe(401);
    expect(err.jsonBody).toEqual({ errKind: 'UNAUTHORIZED', data: { message: 'wrong redirect_uri' } });
  }
})


test('Issue access token.', async () => {
  let hres = await httpPost(`${url()}/oauth/code/issue`, {
    clientId: gClientId,
    userName: gUserName,
    password: gPassword,
    redirectUri: gRedirectUri,
  });
  expect(hres.code).toBeDefined();

  let code = hres.code;

  hres = await httpPost(`${url()}/oauth/token/issue`, {
    grantType: 'code',
    code: code,
    redirectUri: gRedirectUri,
    clientId: gClientId,
  });

  expect(hres.accessToken).toBeDefined();
  expect(hres.tokenType).toEqual('Bearer');
  expect(hres.refreshToken).toBeDefined();
  expect(hres.expiresIn).toBeDefined();
})

test('Do not issue acces token if wrong code.', async () => {
  let hres = await httpPost(`${url()}/oauth/code/issue`, {
    clientId: gClientId,
    userName: gUserName,
    password: gPassword,
    redirectUri: gRedirectUri,
  });
  expect(hres.code).toBeDefined();

  let code = hres.code;

  try {
    hres = await httpPost(`${url()}/oauth/token/issue`, {
      grantType: 'code',
      code: code + 'xxx',
      redirectUri: gRedirectUri,
      clientId: gClientId,
    });
    expect(true).toBe(false);
  } catch(err) {
    expect(err instanceof HttpError).toBe(true);
    expect(err.status).toBe(401);
    expect(err.jsonBody).toEqual({ errKind: 'UNAUTHORIZED', data: { message: 'no such code' } });
  }

})

test('Do not issue acces token if inavlid grant type.', async () => {
  let hres = await httpPost(`${url()}/oauth/code/issue`, {
    clientId: gClientId,
    userName: gUserName,
    password: gPassword,
    redirectUri: gRedirectUri,
  });
  expect(hres.code).toBeDefined();

  let code = hres.code;

  try {
    hres = await httpPost(`${url()}/oauth/token/issue`, {
      grantType: 'code_xxxx',
      code: code,
      redirectUri: gRedirectUri,
      clientId: gClientId,
    });
    expect(true).toBe(false);
  } catch(err) {
    expect(err instanceof HttpError).toBe(true);
    expect(err.status).toBe(400);
    expect(err.jsonBody).toEqual({ errKind: 'BAD_REQUEST', data: { message: 'grantType must be \'code\'' } });
  }

})

test('Do not issue acces token if wrong redirect_uri.', async () => {
  let hres = await httpPost(`${url()}/oauth/code/issue`, {
    clientId: gClientId,
    userName: gUserName,
    password: gPassword,
    redirectUri: gRedirectUri,
  });
  expect(hres.code).toBeDefined();

  let code = hres.code;

  try {
    hres = await httpPost(`${url()}/oauth/token/issue`, {
      grantType: 'code',
      code: code,
      redirectUri: gRedirectUri + 'xxx',
      clientId: gClientId,
    });
    expect(true).toBe(false);
  } catch(err) {
    expect(err instanceof HttpError).toBe(true);
    expect(err.status).toBe(401);
    expect(err.jsonBody).toEqual({ errKind: 'UNAUTHORIZED', data: { message: 'wrong redirectUri' } });
  }

})

test('Do not issue acces token if code expired.', async () => {
  let hres = await httpPost(`${url()}/oauth/code/issue`, {
    clientId: gClientId,
    userName: gUserName,
    password: gPassword,
    redirectUri: gRedirectUri,
  });
  expect(hres.code).toBeDefined();

  let code = hres.code;

  try {

    let qres = await query('select issued_at from code where id=$1', [code]);
    let issued_at = qres.rows[0].issued_at;
    issued_at.setTime(issued_at.getTime() - 3600*1000);
    await query("update code set issued_at=$1 where id=$2", [issued_at, code]);

    hres = await httpPost(`${url()}/oauth/token/issue`, {
      grantType: 'code',
      code: code,
      redirectUri: gRedirectUri,
      clientId: gClientId,
    });
    expect(true).toBe(false);
  } catch(err) {
    expect(err instanceof HttpError).toBe(true);
    expect(err.status).toBe(401);
    expect(err.jsonBody).toEqual({ errKind: 'UNAUTHORIZED', data: { message: 'code expired' } });
  }

})

test('After issuing access token code is invalid and removed', async () => {
  let hres = await httpPost(`${url()}/oauth/code/issue`, {
    clientId: gClientId,
    userName: gUserName,
    password: gPassword,
    redirectUri: gRedirectUri,
  });
  expect(hres.code).toBeDefined();

  let code = hres.code;

  hres = await httpPost(`${url()}/oauth/token/issue`, {
    grantType: 'code',
    code: code,
    redirectUri: gRedirectUri,
    clientId: gClientId,
  });

  expect(hres.accessToken).toBeDefined();
  expect(hres.tokenType).toEqual('Bearer');
  expect(hres.refreshToken).toBeDefined();
  expect(hres.expiresIn).toBeDefined();

  try {
    hres = await httpPost(`${url()}/oauth/token/issue`, {
      grantType: 'code',
      code: code,
      redirectUri: gRedirectUri,
      clientId: gClientId,
    });
    expect(true).toBe(false);
  } catch(err) {
    expect(err instanceof HttpError).toBe(true);
    expect(err.status).toBe(401);
    expect(err.jsonBody).toEqual({ errKind: 'UNAUTHORIZED', data: { message: 'no such code' } });
  }
})

test('Refresh acces token.', async () => {
  let hres = await httpPost(`${url()}/oauth/code/issue`, {
    clientId: gClientId,
    userName: gUserName,
    password: gPassword,
    redirectUri: gRedirectUri,
  });
  expect(hres.code).toBeDefined();

  let code = hres.code;

  hres = await httpPost(`${url()}/oauth/token/issue`, {
    grantType: 'code',
    code: code,
    redirectUri: gRedirectUri,
    clientId: gClientId,
  });

  expect(hres.accessToken).toBeDefined();
  expect(hres.tokenType).toEqual('Bearer');
  expect(hres.refreshToken).toBeDefined();
  expect(hres.expiresIn).toBeDefined();

  let refreshToken = hres.refreshToken;
  hres = await httpPost(`${url()}/oauth/token/refresh`, {
    grantType: 'refresh_token',
    refreshToken: refreshToken,
  });

  expect(hres.accessToken).toBeDefined();
  expect(hres.tokenType).toEqual('Bearer');
  expect(hres.refreshToken).toBeDefined();
  expect(hres.expiresIn).toBeDefined();
})

test('Do not Refresh acces token with invalid refresh token.', async () => {
  let hres = await httpPost(`${url()}/oauth/code/issue`, {
    clientId: gClientId,
    userName: gUserName,
    password: gPassword,
    redirectUri: gRedirectUri,
  });
  expect(hres.code).toBeDefined();

  let code = hres.code;

  hres = await httpPost(`${url()}/oauth/token/issue`, {
    grantType: 'code',
    code: code,
    redirectUri: gRedirectUri,
    clientId: gClientId,
  });

  expect(hres.accessToken).toBeDefined();
  expect(hres.tokenType).toEqual('Bearer');
  expect(hres.refreshToken).toBeDefined();
  expect(hres.expiresIn).toBeDefined();

  try {
    let refreshToken = hres.refreshToken;
    hres = await httpPost(`${url()}/oauth/token/refresh`, {
      grantType: 'refresh_token',
      refreshToken: refreshToken + 'xxx',
    });
    expect(true).toBe(false);
  } catch(err) {
    expect(err instanceof HttpError).toBe(true);
    expect(err.status).toBe(401);
    expect(err.jsonBody).toEqual({ errKind: 'UNAUTHORIZED', data: { message: 'inavlid refresh token' } });
  }

})

test('Do not Refresh acces token with invalid grant.', async () => {
  let hres = await httpPost(`${url()}/oauth/code/issue`, {
    clientId: gClientId,
    userName: gUserName,
    password: gPassword,
    redirectUri: gRedirectUri,
  });
  expect(hres.code).toBeDefined();

  let code = hres.code;

  hres = await httpPost(`${url()}/oauth/token/issue`, {
    grantType: 'code',
    code: code,
    redirectUri: gRedirectUri,
    clientId: gClientId,
  });

  expect(hres.accessToken).toBeDefined();
  expect(hres.tokenType).toEqual('Bearer');
  expect(hres.refreshToken).toBeDefined();
  expect(hres.expiresIn).toBeDefined();

  try {
    let refreshToken = hres.refreshToken;
    hres = await httpPost(`${url()}/oauth/token/refresh`, {
      grantType: 'refresh_token_xxxxx',
      refreshToken: refreshToken,
    });
    expect(true).toBe(false);
  } catch(err) {
    expect(err instanceof HttpError).toBe(true);
    expect(err.status).toBe(400);
    expect(err.jsonBody).toEqual({ errKind: 'BAD_REQUEST', data: { message: 'grant_type must be \'refresh_token\'' } });
  }

})
