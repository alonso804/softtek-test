import type { Prettify } from 'src/helpers/types';

import type { SWPlanet } from './star-wars';
import type { Weather } from './weather';

export type Planet = Prettify<
  SWPlanet & {
    weather: Weather;
  } & {
    customFields: Record<string, string>[];
  }
>;
