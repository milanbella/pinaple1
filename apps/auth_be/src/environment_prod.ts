import { IEnvironment } from './types';

export let environment: IEnvironment = {
  appName: 'pinaple-auth-be',

  port: 5201,

  sshKeyFilePath: './key.pem'; 
  sshCertFilePath: './cert.pem';

  apiProtocol: 'https',
  apiHost: 'pinaple-api',
  apiPort: 443,
}

