import { environment } from './environment'; 

export function apiUrl() {
  return `${environment.apiProtocol}://${environment.apiHost}${(environment.apiPort === 80 || environment.apiPort === 443)  ? '' : ':' + environment.apiPort}`
}

export function authUrl() {
  return `${environment.authProtocol}://${environment.authHost}${(environment.apiPort === 80 || environment.apiPort === 443) ? '' : ':' + environment.authPort}`
}

export function getClientId(isTest=false) {
  if (isTest === false) {
    return environment.oauthClientId;
  }
}
