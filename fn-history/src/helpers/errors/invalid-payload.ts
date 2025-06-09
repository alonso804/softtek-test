import { StatusCode } from '../types';
import { BaseError } from './base-error';

export class InvalidPayloadError extends BaseError {
  constructor(statusCode: StatusCode, message: Record<string, unknown> | string) {
    super(statusCode, message);
  }
}
