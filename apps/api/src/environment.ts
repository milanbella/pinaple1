export interface IEnvironment {
  apiProtocol: string;
  apiHost: string;
  apiPort: number;

  pgUser: string;
  pgHost: string;
  pgDatabase: string;
  pgPassword: string;
  pgPort: number;
}

export let environment: IEnvironment = {
  apiProtocol: 'http',
  apiHost: 'localhost',
  apiPort: 3355,

  pgUser: 'auth',
  pgHost: 'localhost',
  pgDatabase: 'auth',
  pgPassword: 'auth',
  pgPort: 5433,
}
