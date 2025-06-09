import { z } from 'zod';

import { STATUS_CODE } from './constants';
import { paginationSchema } from './schemas';

export type StatusCode = (typeof STATUS_CODE)[keyof typeof STATUS_CODE];

export type HttpResponse = {
  statusCode: StatusCode;
  body: string;
};

export type ISODate = string;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Pagination = z.infer<typeof paginationSchema>;
