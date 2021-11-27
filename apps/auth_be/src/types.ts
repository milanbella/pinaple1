export interface IEnvironment {
  appName: string;

  port: number;

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
