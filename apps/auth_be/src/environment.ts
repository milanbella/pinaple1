export interface IEnvironment {
  port: number;

  apiProtocol: string;
  apiHost: string;
  apiPort: number;
}

export let environment: IEnvironment = {
  port: 4101,

  apiProtocol: 'http',
  apiHost: 'localhost',
  apiPort: 5100,
}

