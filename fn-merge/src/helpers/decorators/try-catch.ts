import { DynamoDBServiceException } from '@aws-sdk/client-dynamodb';
import { LibsqlError } from '@libsql/client';
import { isAxiosError } from 'axios';

import { STATUS_CODE } from '../constants';
import { BaseError } from '../errors/base-error';
import { DynamoDBError } from '../errors/dynamodb';
import { FetchError } from '../errors/fetch-error';
import { SQLError } from '../errors/sql';
import { StatusCode } from '../types';

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
        if (isAxiosError(error)) {
          console.error('Error type: AxiosError');
          const statusCode =
            (error.response?.status as StatusCode) || STATUS_CODE.INTERNAL_SERVER_ERROR_500;
          const message = error.response?.data || error.message;

          throw new FetchError(statusCode, message);
        }

        if (error instanceof LibsqlError) {
          console.error('Error type: LibsqlError');
          console.error(`Cause: ${JSON.stringify(error.cause)}`);

          const statusCode = STATUS_CODE.INTERNAL_SERVER_ERROR_500;
          const message = error.message;

          throw new SQLError(statusCode, message as Record<string, unknown> | string);
        }

        if (error instanceof DynamoDBServiceException) {
          console.error(`[DynamoDBServiceException] Error type: ${error.name}`);

          const statusCode =
            error.$metadata?.httpStatusCode || STATUS_CODE.INTERNAL_SERVER_ERROR_500;
          const message = error.message;

          throw new DynamoDBError(statusCode, message);
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
