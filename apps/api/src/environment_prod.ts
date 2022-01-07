import { IEnvironment } from './types'; 

export let environment: IEnvironment = {
  appName: 'pinaple-api', 

  apiProtocol: 'http',
  apiHost: 'localhost',
  apiPort: 80,

  pgAuthUser: 'auth',
  pgAuthHost: 'localhost',
  pgAuthDatabase: 'auth',
  pgAuthPassword: 'auth',
  pgAuthPort: 5433,

  pgAdUser: 'ad',
  pgAdHost: 'localhost',
  pgAdDatabase: 'ad',
  pgAdPassword: 'ad',
  pgAdPort: 5433,

  codeTokenValiditySeconds: 10,
  accessTokenValiditySecons: 3600,
  refreshTokenValidityHours: 5,
}
