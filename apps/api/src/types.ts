export interface IEnvironment {
  appName: string;

  apiProtocol: string;
  apiHost: string;
  apiPort: number;

  pgAuthUser: string;
  pgAuthHost: string;
  pgAuthDatabase: string;
  pgAuthPassword: string;
  pgAuthPort: number;

  codeTokenValiditySeconds: number;
  accessTokenValiditySecons: number;
  refreshTokenValidityHours: number;
}
