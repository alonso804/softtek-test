import { STATUS_CODE } from 'src/helpers/constants';
import type { StatusCode } from 'src/helpers/types';

export class BaseError extends Error {
  constructor(
    public status: StatusCode = STATUS_CODE.INTERNAL_SERVER_ERROR_500,
    message: string | Record<string, unknown>,
  ) {
    super(JSON.stringify(message));
    this.status = status;
  }
}
