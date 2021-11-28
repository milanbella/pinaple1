import { environment } from '../environment';

export function url() {
  return `${environment.apiProtocol}://${environment.apiHost}${environment.apiPort === 80 ? '' : ':' + environment.apiPort}`;
}
