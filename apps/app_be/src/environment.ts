import { IEnvironment } from './types';

export let environment: IEnvironment = {
  appName: 'pinaple-app-be',

  port: 5301,

  sshKeyFilePath: './key_l.pem', 
  sshCertFilePath: './cert_l.pem',

  apiProtocol: 'https',
  apiHost: 'pinaple-api',
  apiPort: 443,

  authProtocol: 'https',
  authHost: 'pinaple-auth',
  authPort: 443,

  oauthClientId: '1b9696c0-50d6-11ec-bff4-4b46c86d9618',
}

