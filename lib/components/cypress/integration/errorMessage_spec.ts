import { environment } from './environment';
import { httpDelete } from 'pinaple_www/dist/http';

import { mount } from '@cypress/react'

const FILE = 'registration_page_spec.ts';


describe('Registartion Page', () => {

  it('Opens page and closes error message pane.', () => {
    cy.visit(`${environment.url}/errorMessage`);
    cy.get('.PErrorMessage').contains('PErrorMessage component').get('span').click().then(() => {
    });
    cy.get('.PErrorMessage').contains('PErrorMessage component').should('not.exist');
    cy.get('div').contains('Message was closed!').should('exist');
  })

})
