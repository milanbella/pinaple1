export interface IEnvironment {
  protocol: string;
  host: string;
  port: number;
}

export let environment: IEnvironment = {
  protocol: 'http',
  host: 'localhost',
  port: 3355,
}
