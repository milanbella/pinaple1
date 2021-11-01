export interface IEnvironment {
  authProtocol: string;
  authHost: string;
  authPort: number;

  oauthClientId: string;
  oauthRedirectUri: string;
}

export let environment: IEnvironment = {
  authProtocol: 'http',
  authHost: 'pinaple_auth',
  authPort: 80,

  oauthClientId: 'XXXXXXX',
  oauthRedirectUri: 'http://pinaple:7300'
}
