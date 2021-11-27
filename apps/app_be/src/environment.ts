import { IEnvironment } from './types';

export let environment: IEnvironment = {
  appName: 'pinaple-app-be',

  port: 5301,

  apiProtocol: 'http',
  apiHost: 'pinaple-api',
  apiPort: 80,

  authProtocol: 'http',
  authHost: 'pinaple-auth',
  authPort: 80,

  oauthClientId: '874c2480-4e05-11ec-8cc4-1d0236bb7edf',
  oauthRedirectUri: 'http://pinaple-app/api/token',
}

