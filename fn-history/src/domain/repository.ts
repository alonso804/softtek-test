import { Pagination } from 'src/helpers/types';

import { Planet } from './model';

export interface PlanetRepository {
  find(filter: Record<string, unknown>, pagination: Pagination): Promise<Planet[]>;
}
