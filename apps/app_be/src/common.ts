import { environment } from './environment'; 

export function apiUrl() {
  return `${environment.apiProtocol}://${environment.apiHost}:${environment.apiPort}`
}
