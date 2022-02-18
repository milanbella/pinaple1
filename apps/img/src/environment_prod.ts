import { IEnvironment } from './types';

export let environment: IEnvironment = {
  appName: 'pinaple-img',

  port: 5401,

  sshKeyFilePath: './key.pem', 
  sshCertFilePath: './cert.pem',

}
