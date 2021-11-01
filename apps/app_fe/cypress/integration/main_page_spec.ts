import { environment } from './environment';

describe('Home page', () => {

  it('Visits the Home Page', () => {
    cy.visit(environment.url);
    cy.get('nav li a').contains('Prihlásiť');
    cy.get('nav li a').contains('Zaregistrovať');
  })

  it('Opens Registartion Page', () => {
    cy.get('nav li a').contains('Zaregistrovať').click();
  })
})
