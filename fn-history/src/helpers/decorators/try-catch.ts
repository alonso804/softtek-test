import { LibsqlError } from '@libsql/client';

import { STATUS_CODE } from '../constants';
import { BaseError } from '../errors/base-error';
import { SQLError } from '../errors/sql';

export function TryCatch(_target: unknown, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: unknown[]) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      console.group('@TryCatch Error');
      console.error(`Error in '${this.constructor.name}.${propertyKey}'`);
      console.error(`Params: ${JSON.stringify(args)}`);

      if (error instanceof Error) {
        if (error instanceof LibsqlError) {
          console.error('Error type: LibsqlError');
          console.error(`Cause: ${JSON.stringify(error.cause)}`);

          const statusCode = STATUS_CODE.INTERNAL_SERVER_ERROR_500;
          const message = error.message;

          throw new SQLError(statusCode, message as Record<string, unknown> | string);
        }

        console.log('Error type: Error');
        console.error('Error message:', error.message);
        console.log(JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        console.groupEnd();

        throw new BaseError(STATUS_CODE.INTERNAL_SERVER_ERROR_500, error.message);
      }

      console.error('Unknown error:', error);

      console.groupEnd();
      throw error;
    }
  };

  return descriptor;
}
