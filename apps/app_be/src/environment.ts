export interface IEnvironment {
  port: number;

  authProtocol: string;
  authHost: string;
  authPort: number;

  oauthClientId: string;
}

export let environment: IEnvironment = {
  port: 5301,

  authProtocol: 'http',
  authHost: 'pinaple_auth',
  authPort: 80,

  oauthClientId: 'XXXXXXX',
}

