export interface IEnvironment {
  appName: string;

  port: number;

  sshKeyFilePath: string; 
  sshCertFilePath: string;

  apiProtocol: string;
  apiHost: string;
  apiPort: number;
}

export interface Authorize {
  clientId: string;
  clientName: string;
  redirectUri: string;
}

export interface Session {
  authorize: Authorize; 
}
