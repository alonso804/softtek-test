import { AVAILABLE_METHODS, AVAILABLE_PATHS, STATUS_CODE } from './constants';

export type StatusCode = (typeof STATUS_CODE)[keyof typeof STATUS_CODE];

export type HttpResponse = {
  statusCode: StatusCode;
  body: string;
};

export type AvailableMethod = (typeof AVAILABLE_METHODS)[number];
export type AvalidablePath = (typeof AVAILABLE_PATHS)[number];
