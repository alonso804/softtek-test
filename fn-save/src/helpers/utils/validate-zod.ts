import type { ZodType } from 'zod';

import { STATUS_CODE } from '../constants';
import { InvalidPayloadError } from '../errors/invalid-payload';

/**
 * Validate the request data against a schema.
 *
 * @template T - The request type.
 *
 * @param schema - The schema that will be used to validate the request.
 * @param request - The request data to validate.
 *
 * @returns Parsed request data if the validation is successful.
 */
export const validator = async <T>(schema: ZodType, request: unknown): Promise<T> => {
  const result = await schema.safeParseAsync(request);

  if (!result.success) {
    const errors: Record<string, string[]> = {};

    result.error.issues.forEach(({ path, message }) => {
      const key = path.join('.');

      if (!errors[key]) {
        errors[key] = [];
      }

      errors[key].push(message);
    });

    console.log(errors);

    throw new InvalidPayloadError(STATUS_CODE.BAD_REQUEST_400, errors);
  }

  return result.data as T;
};
