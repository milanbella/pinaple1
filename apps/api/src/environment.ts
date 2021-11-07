import { IEnvironment } from './types'; 

export let environment: IEnvironment = {
  apiProtocol: 'http',
  apiHost: 'localhost',
  apiPort: 5100,

  pgUser: 'auth',
  pgHost: 'localhost',
  pgDatabase: 'auth',
  pgPassword: 'auth',
  pgPort: 5433,

  codeTokenValiditySeconds: 10,
  accessTokenValiditySecons: 3600,
  refreshTokenValidityHours: 5,
}
