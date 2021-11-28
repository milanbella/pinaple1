export interface IEnvironment {
  appName: string;

  port: number;

  apiProtocol: string;
  apiHost: string;
  apiPort: number;

  authProtocol: string;
  authHost: string;
  authPort: number;

  oauthClientId: string;
}
