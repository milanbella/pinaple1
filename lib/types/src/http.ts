//
// Common types
//
//
//
export enum ResponseErrorKind {
  JSON_SCHEMA_IN_VALIDATION = 'ERROR_JSON_SCHEMA_IN_VALIDATION',
  JSON_SCHEMA_OUT_VALIDATION = 'ERROR_JSON_SCHEMA_OUT_VALIDATION',
  WRONG_PARAMETR = 'ERROR_WRONG_PARAMETRS',
  RESOURCE_EXISTS = 'ERROR_RESOURCE_EXISTS',
  INTERNAL_ERROR = 'ERROR_INTERNAL_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  BAD_REQUEST = 'BAD_REQUEST',

}

export interface IResposeErrorData {
  message: string;
  value?: any;
}

export interface IResponseError {
  errKind: ResponseErrorKind;
  data: IResposeErrorData;
}
