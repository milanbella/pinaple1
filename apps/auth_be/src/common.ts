import { environment } from './environment'; 
export type tErrorCode = 'invalid_request'

export function redirectWithErrorResponse(ctx, redirectUri: string, errorCode: string, errorDescription?: string) {
  if (errorDescription) {
    ctx.response.redirect(`${redirectUri}?err=${errorCode}&error_description=${encodeURIComponent(errorDescription)}`)
  } else {
    ctx.response.redirect(`${redirectUri}?err=${errorCode}`)
  }
}


export function apiUrl() {
  return `${environment.apiProtocol}://${environment.apiHost}${(environment.apiPort === 80 || environment.apiPort === 443) ? '' : ':' + environment.apiPort  }`
}
