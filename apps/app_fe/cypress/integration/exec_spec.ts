import { environment } from './environment';
import { httpPost, httpDelete } from 'pinaple_www/dist/http';
import { HttpError } from 'pinaple_www/dist/http';

const FILE = 'exec_spec.ts';




describe('Exec', () => {

  it('Exec command', () => {
    cy.exec('ls');
  })

})
