enum ResponseErrorKind {
  JSON_SCHEMA_VALIDATION = 'ERROR_JSON_SCHEMA_VALIDATION',
  RESOURCE_EXISTS = 'ERROR_RESOURCE_EXISTS',
  INTERNAL_ERROR = 'ERROR_INTERNAL_ERROR',
  NOT_FOUND = 'NOT_FOUND',
}

interface IResponseError {
  errKind: ResponseErrorKind;
  data: any
}
