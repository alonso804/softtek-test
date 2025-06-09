import './config';

import type { APIGatewayEvent, Handler } from 'aws-lambda';

import { Merger } from './application/merger';
import { STATUS_CODE } from './helpers/constants';
import { BaseError } from './helpers/errors/base-error';
import type { HttpResponse } from './helpers/types';
import { parseResponse } from './helpers/utils/parse-response';
import { container } from './infrastructure/dependencies';

const main = async () => {
  try {
    const merger = container.resolve<Merger>('merger');

    const response = await merger.run();

    return { response, error: null };
  } catch (error) {
    if (error instanceof BaseError) {
      return {
        response: null,
        error: parseResponse(error.status, { message: JSON.parse(error.message) }),
      };
    }

    return {
      response: null,
      error: parseResponse(STATUS_CODE.INTERNAL_SERVER_ERROR_500, {
        message: 'An unexpected error occurred.',
      }),
    };
  }
};

export const handler: Handler<APIGatewayEvent, HttpResponse> = async (_event) => {
  const { response, error } = await main();

  if (error) {
    return error;
  }

  return parseResponse(STATUS_CODE.CREATED_201, response);
};
