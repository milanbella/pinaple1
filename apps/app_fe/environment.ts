export interface IEnvironment {
  authProtocol: string;
  authHost: string;
  authPort: number;

  oauthClientId: string;
  oauthRedirectUri: string;
}

export let environment: IEnvironment = {
  authProtocol: 'http',
  authHost: 'pinaple-auth',
  authPort: 80,

  oauthClientId: 'XXXXXXX',
  oauthRedirectUri: 'http://pinaple-app:7300'
}
