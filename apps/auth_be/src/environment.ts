export interface IEnvironment {
  port: number;

  apiProtocol: string;
  apiHost: string;
  apiPort: number;
}

export let environment: IEnvironment = {
  port: 5201,

  apiProtocol: 'http',
  apiHost: 'pinaple_api',
  apiPort: 80,
}

