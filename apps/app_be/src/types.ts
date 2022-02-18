export interface IEnvironment {
  appName: string;

  port: number;

  apiProtocol: string;
  apiHost: string;
  apiPort: number;

  sshKeyFilePath: string; 
  sshCertFilePath: string;

  authProtocol: string;
  authHost: string;
  authPort: number;

  oauthClientId: string;
}
