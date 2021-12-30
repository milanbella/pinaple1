import { IEnvironment } from './types'; 

export let environment: IEnvironment = {
  appName: 'pinaple-api', 

  apiProtocol: 'https',
  apiHost: 'localhost',
  apiPort: 5100,

  pgAuthUser: 'auth',
  pgAuthHost: 'localhost',
  pgAuthDatabase: 'auth',
  pgAuthPassword: 'auth',
  pgAuthPort: 5433,

  codeTokenValiditySeconds: 10,
  accessTokenValiditySecons: 3600,
  refreshTokenValidityHours: 5,
}
