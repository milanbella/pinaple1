//
// Common types
//
export enum ResponseErrorKind {
  JSON_SCHEMA_VALIDATION = 'ERROR_JSON_SCHEMA_VALIDATION',
  WRONG_PARAMETR = 'ERROR_WRONG_PARAMETRS',
  RESOURCE_EXISTS = 'ERROR_RESOURCE_EXISTS',
  INTERNAL_ERROR = 'ERROR_INTERNAL_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  BAD_REQUEST = 'BAD_REQUEST',

}

export interface IResposeErrorData {
  message: string;
}

export interface IResponseError {
  errKind: ResponseErrorKind;
  data: IResposeErrorData;
}
