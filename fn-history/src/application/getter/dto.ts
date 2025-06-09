import { Planet } from 'src/domain/model';
import { Pagination } from 'src/helpers/types';

export type GetterReq = {
  pagination: Pagination;
};

export type GetterRes = Planet[];
