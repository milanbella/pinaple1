import { environment } from './environment';
import { httpPost, httpDelete } from 'pinaple_www/dist/http';
import { HttpError } from 'pinaple_www/dist/http';

const FILE = 'login_page_spec.ts';

async function createUser() {
  const FUNC = 'createUser()';
  try {
    let hres = await httpPost(`${environment.apiUrl}/user`, {
      userName: "milanbella",
      email: "milanbella@hotmail.com",
      password: "foo"
    });
  } catch(err) {
    console.error(`${FILE}:${FUNC}: error`, err);
    throw Error('could not create user');
  }
}

async function removeUser() {
  const FUNC = 'removeUser()';
  try {
    let hres = await httpDelete(`${environment.apiUrl}/user`, {
      userName: 'milanbella'
    });
  } catch(err) {
    console.error(`${FILE}:${FUNC}: error`, err);
    throw Error('could not remove user');
  }
}

async function createClient() {
  const FUNC = 'createClient()';
  try {
    let hres = await httpPost(`${environment.apiUrl}/client`, {
      clientName: "pinaple",
      redirectUri: "http://pinaple-app/api/token"
    });
  } catch(err) {
    console.error(`${FILE}:${FUNC}: error`, err);
    throw Error('could not create client');
  }
}

async function removeClient() {
  const FUNC = 'removeClient()';
  try {
    let hres = await httpDelete(`${environment.apiUrl}/client`, {
      clientName: 'pinaple'
    });
  } catch(err) {
    console.error(`${FILE}:${FUNC}: error`, err);
    throw Error('could not remove client');
  }
}


before(async () => {
  removeUser();
  removeClient();

  createClient();
  createUser();
});

after(async () => {
  removeUser();
  removeClient();
});

describe('Login Page', () => {

  it('Open Login Page.', () => {
    cy.visit(environment.url);
    cy.get('nav li a').contains('Prihlásiť').click();
  })

})
