export interface Authorize {
  clientId: string;
  clientName: string;
  redirectUri: string;
}

export interface Session {
  authorize: Authorize; 
}
