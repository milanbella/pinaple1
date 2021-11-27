import { IEnvironment } from './types'; 

export let environment: IEnvironment = {
  appName: 'pinaple-api', 

  apiProtocol: 'http',
  apiHost: 'localhost',
  apiPort: 80,

  pgUser: 'auth',
  pgHost: 'localhost',
  pgDatabase: 'auth',
  pgPassword: 'auth',
  pgPort: 5433,

  codeTokenValiditySeconds: 10,
  accessTokenValiditySecons: 3600,
  refreshTokenValidityHours: 5,
}
