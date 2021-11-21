import { IEnvironment } from './types';

export let environment: IEnvironment = {
  port: 80,

  apiProtocol: 'http',
  apiHost: 'pinaple-api-k',
  apiPort: 80,

  authProtocol: 'http',
  authHost: 'pinaple-auth-k',
  authPort: 80,

  oauthClientId: 'XXXXXXX',
  oauthRedirectUri: 'http://pinaple-app-k/api/token',
}

