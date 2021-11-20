import { environment } from './environment'; 

export function apiUrl() {
  return `${environment.apiProtocol}://${environment.apiHost}:${environment.apiPort}`
}

export function authUrl() {
  return `${environment.authProtocol}://${environment.authHost}:${environment.authPort}`
}
