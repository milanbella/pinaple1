import { IEnvironment } from './types';

export let environment: IEnvironment = {
  appName: 'pinaple-auth-be',

  port: 5201,

  sshKeyFilePath: './key_l.pem'; 
  sshCertFilePath: './cert_l.pem';

  apiProtocol: 'https',
  apiHost: 'pinaple-api-l',
  apiPort: 443,
}

