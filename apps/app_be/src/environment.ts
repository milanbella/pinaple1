export interface IEnvironment {
  port: number;

  authProtocol: string;
  authHost: string;
  authPort: number;

  oauthClientId: string;
}

export let environment: IEnvironment = {
  port: 4091,

  authProtocol: 'http',
  authHost: 'localhost',
  authPort: 4101,

  oauthClientId: 'XXXXXXX',
}

