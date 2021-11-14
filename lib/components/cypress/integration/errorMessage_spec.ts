import { environment } from './environment';
import { httpDelete } from 'pinaple_www/dist/http';

const FILE = 'registration_page_spec.ts';


describe('Registartion Page', () => {

  it('Opens Page', () => {
    cy.visit(`${environment.url}/errorMessage`);
    cy.get('.PErrorMessage').contains('PErrorMessage component').get('span').click();
    cy.get('.PErrorMessage').contains('PErrorMessage component').should('not.exist');
  })


})
