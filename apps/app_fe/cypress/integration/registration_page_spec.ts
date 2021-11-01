import { environment } from './environment';

describe('Registartion Page', () => {

  it('Opens Registartion Page', () => {
    cy.visit(environment.url);
    cy.get('nav li a').contains('Zaregistrovať').click();
    cy.get('main #header').contains('Registrácia');
  })

  it('Fills in registration form', () => {

    cy.get('input[name=userName]').type('milanbella');
  })

})
