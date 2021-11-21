import { environment } from '../environment';
import { httpGet, httpPost, httpDelete, HttpError } from 'pinaple_www/dist/http';
import { initPool, releasePool, query  } from 'pinaple_www/dist/pool';

const fetch = require('node-fetch');

initPool(environment.pgUser, environment.pgHost, environment.pgDatabase, environment.pgPassword, environment.pgPort); 

afterAll(() => {
  return releasePool();
});

function url() {
  return `${environment.apiProtocol}://${environment.apiHost}:${environment.apiPort}`;
}

async function cleanDb() {
  await query("delete from users where user_name in ('johnDoe') or email in ('johndoe25@foo.com',  'johndoe@foo.com')");
}

test('Create new user', async () => {
  await cleanDb();

  let result = await httpPost(`${url()}/user`, {
    userName: 'johnDoe',
    email: 'johndoe@foo.com',
    password: 'bla',
  });
  let qresult = await query("select count(*) as cnt from auth.users where user_name='johnDoe'");
  expect(qresult.rows[0].cnt).toEqual('1');
})

test('Read user by userName', async () => {
  await cleanDb();

  let result = await httpPost(`${url()}/user`, {
    userName: 'johnDoe',
    email: 'johndoe@foo.com',
    password: 'bla',
  });
  let qresult = await query("select count(*) as cnt from auth.users where user_name='johnDoe'");
  expect(qresult.rows[0].cnt).toEqual('1');

  result = await httpGet(`${url()}/user?userName=johnDoe`);

  expect(result.userName).toEqual('johnDoe');
  expect(result.userEmail).toEqual('johndoe@foo.com');
})

test('Read user by userEmail', async () => {
  await cleanDb();

  let result = await httpPost(`${url()}/user`, {
    userName: 'johnDoe',
    email: 'johndoe@foo.com',
    password: 'bla',
  });
  let qresult = await query("select count(*) as cnt from auth.users where user_name='johnDoe'");
  expect(qresult.rows[0].cnt).toEqual('1');

  result = await httpGet(`${url()}/user?userEmail=${encodeURIComponent('johndoe@foo.com')}`);

  expect(result.userName).toEqual('johnDoe');
  expect(result.userEmail).toEqual('johndoe@foo.com');
})


test('Do not create user with same user name', async () => {
  await cleanDb();

  let result = await httpPost(`${url()}/user`, {
    userName: 'johnDoe',
    email: 'johndoe@foo.com',
    password: 'bla',
  });

  try {
    result = await httpPost(`${url()}/user`, {
      userName: 'johnDoe',
      email: 'johndoe25@foo.com',
      password: 'bla',
    });
  } catch(err) {
    expect(err instanceof HttpError).toEqual(true);
    expect(err.status === 409);
    expect(err.body).toEqual({
      errKind: 'ERROR_RESOURCE_EXISTS',
      data: { message: 'user name already exists' }
    });

  }
})

test('Do not create user with same email', async () => {
  await cleanDb();

  let result = await httpPost(`${url()}/user`, {
    userName: 'johnDoe',
    email: 'johndoe@foo.com',
    password: 'bla',
  });

  try {
    result = await httpPost(`${url()}/user`, {
      userName: 'johnDoe25',
      email: 'johndoe@foo.com',
      password: 'bla',
    });
  } catch(err) {
    expect(err instanceof HttpError).toEqual(true);
    expect(err.status === 409);
    expect(err.body).toEqual({
      errKind: 'ERROR_RESOURCE_EXISTS',
      data: { message: 'user email already exists' }
    });

  }
})

test('Delete user by username', async () => {
  await cleanDb();

  let result = await httpPost(`${url()}/user`, {
    userName: 'johnDoe',
    email: 'johndoe@foo.com',
    password: 'bla',
  });
  let qresult = await query("select count(*) as cnt from auth.users where user_name='johnDoe'");
  expect(qresult.rows[0].cnt).toEqual('1');

  result = await httpDelete(`${url()}/user`, {
    userName: 'johnDoe'
  });
  qresult = await query("select count(*) as cnt from auth.users where user_name='johnDoe'");
  expect(qresult.rows[0].cnt).toEqual('0');
})

test('Delete user by email', async () => {
  await cleanDb();

  let result = await httpPost(`${url()}/user`, {
    userName: 'johnDoe',
    email: 'johndoe@foo.com',
    password: 'bla',
  });
  let qresult = await query("select count(*) as cnt from auth.users where user_name='johnDoe'");
  expect(qresult.rows[0].cnt).toEqual('1');

  result = await httpDelete(`${url()}/user`, {
    email: 'johndoe@foo.com'
  });
  qresult = await query("select count(*) as cnt from auth.users where email='johndoe@foo.com'");
  expect(qresult.rows[0].cnt).toEqual('0');
})

test('Delete user by username and email', async () => {
  await cleanDb();

  let result = await httpPost(`${url()}/user`, {
    userName: 'johnDoe',
    email: 'johndoe@foo.com',
    password: 'bla',
  });
  let qresult = await query("select count(*) as cnt from auth.users where user_name='johnDoe'");
  expect(qresult.rows[0].cnt).toEqual('1');

  result = await httpDelete(`${url()}/user`, {
    email: 'johndoe@foo.com'
  });
  qresult = await query("select count(*) as cnt from auth.users where user_name='johnDoe' or email='johndoe@foo.com'");
  expect(qresult.rows[0].cnt).toEqual('0');
})
