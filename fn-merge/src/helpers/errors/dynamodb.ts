import { STATUS_CODE } from 'src/helpers/constants';
import type { StatusCode } from 'src/helpers/types';

import { BaseError } from './base-error';

export class DynamoDBError extends BaseError {
  constructor(
    statusCode: StatusCode = STATUS_CODE.INTERNAL_SERVER_ERROR_500,
    message: string | Record<string, unknown>,
  ) {
    super(statusCode, message);
  }
}
