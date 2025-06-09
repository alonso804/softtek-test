import './config';

import type { APIGatewayEvent, Handler } from 'aws-lambda';
import { z } from 'zod';

import { Getter } from './application/getter';
import { STATUS_CODE } from './helpers/constants';
import { BaseError } from './helpers/errors/base-error';
import { paginationSchema } from './helpers/schemas';
import type { HttpResponse } from './helpers/types';
import { parseResponse } from './helpers/utils/parse-response';
import { validator } from './helpers/utils/validate-zod';
import { container } from './infrastructure/dependencies';

const schema = paginationSchema;
type Req = z.infer<typeof schema>;

const main = async (params: unknown) => {
  try {
    const payload = await validator<Req>(schema, params);

    const getter = container.resolve<Getter>('getter');

    const response = await getter.run({ pagination: payload });

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

export const handler: Handler<APIGatewayEvent, HttpResponse> = async (event) => {
  const { response, error } = await main((event.queryStringParameters ?? {}) as unknown as Req);

  if (error) {
    return error;
  }

  return parseResponse(STATUS_CODE.OK_200, response);
};
