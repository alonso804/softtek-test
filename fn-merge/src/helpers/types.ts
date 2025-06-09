import { STATUS_CODE } from './constants';

export type StatusCode =
  | (typeof STATUS_CODE)[keyof typeof STATUS_CODE]
  | (number & { _custom?: never });

export type HttpResponse = {
  statusCode: StatusCode;
  body: string;
};

export type URI = string;

export type ISODate = string;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Time = { hrs?: number; min?: number; sec?: number };
