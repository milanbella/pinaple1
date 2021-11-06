export interface IEnvironment {
  apiProtocol: string;
  apiHost: string;
  apiPort: number;

  pgUser: string;
  pgHost: string;
  pgDatabase: string;
  pgPassword: string;
  pgPort: number;

  codeTokenValiditySeconds: number;
  accessTokenValiditySecons: number;
  refreshTokenValidityHours: number;
}
