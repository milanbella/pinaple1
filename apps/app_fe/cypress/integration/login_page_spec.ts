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



before(async () => {
  await removeUser();
  await createUser();
});

after(async () => {
  //await removeUser();
});

describe('Login Page', () => {

  it('Open Login Page.', () => {
    cy.visit(environment.url);
    cy.get('nav li a').contains('Prihlásiť').click();
    cy.get('#header').contains('Prihlásiť sa');
  });

  it('Logs in.', () => {
    cy.get('input[name=userName]').type('milanbella');
    cy.get('input[name=password]').type('foo');
    cy.get('a.btn').contains('Odošli').click();
  });

})
