import { IEnvironment } from './types';

export let environment: IEnvironment = {
  port: 5301,

  apiProtocol: 'http',
  apiHost: 'pinaple-api',
  apiPort: 80,

  authProtocol: 'http',
  authHost: 'pinaple-auth',
  authPort: 80,

  oauthClientId: '56000b30-4acc-11ec-9f0d-73f2d3185a88',
  oauthRedirectUri: 'http://pinaple-app/api/token',
}

