export interface IEnvironment {
  apiProtocol: string;
  apiHost: string;
  apiPort: number;
}

export let environment: IEnvironment = {
  apiProtocol: 'http',
  apiHost: 'localhost',
  apiPort: 3355,
}

