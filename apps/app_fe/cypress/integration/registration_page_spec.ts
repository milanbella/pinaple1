import { environment } from './environment';
import { httpDelete } from 'pinaple_www/dist/http';

const FILE = 'registration_page_spec.ts';

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
})

describe('Registartion Page', () => {

  it('Opens Registartion Page', () => {
    cy.visit(environment.url);
    cy.get('nav li a').contains('Zaregistrovať').click();
    cy.get('main #header').contains('Registrácia');
  })

  it('Fills in registration form', () => {

    cy.get('input[name=userName]').type('milanbella');
    cy.get('input[name=email]').type('milanbella@hotmail.com');
    cy.get('input[name=password]').type('xxx');
    cy.get('input[name=passwordConfirm]').type('xxx');
    cy.get('a.btn').click();
  })

})
