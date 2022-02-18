export interface IEnvironment {
  appName: string;

  apiProtocol: string;
  apiHost: string;
  apiPort: number;

  sshKeyFilePath: string; 
  sshCertFilePath: string;

  pgAuthUser: string;
  pgAuthHost: string;
  pgAuthDatabase: string;
  pgAuthPassword: string;
  pgAuthPort: number;

  pgAdUser: string;
  pgAdHost: string;
  pgAdDatabase: string;
  pgAdPassword: string;
  pgAdPort: number;

  codeTokenValiditySeconds: number;
  accessTokenValiditySecons: number;
  refreshTokenValidityHours: number;
}
