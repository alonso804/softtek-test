import { HttpResponse, StatusCode } from '../types';

export const parseResponse = <T>(statusCode: StatusCode, data: T): HttpResponse => ({
  statusCode,
  body: JSON.stringify(data),
});
