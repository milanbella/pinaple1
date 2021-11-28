import { environment } from '../environment';
import { httpPost, HttpError } from 'pinaple_www/dist/http';

function url() {
  return `${environment.apiProtocol}://${environment.apiHost}${environment.apiPort === 80 ? '' : ':' + environment.apiPort}`;
}

test('Exchange code', async () => {
  try {
    let hres = await httpPost(`${url()}/token/`, 'grant_type=authorization_code&code=0f80eb50-f03b-4812-82ae-4c263488a1cb&client_id=874c2480-4e05-11ec-8cc4-1d0236bb7edf', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  } catch(err) {
    expect(err instanceof HttpError).toBe(true);
  }
})
