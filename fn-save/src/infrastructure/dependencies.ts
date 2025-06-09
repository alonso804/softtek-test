import { createClient } from '@libsql/client';
import { asClass, asValue, createContainer } from 'awilix';
import { CONFIG } from 'src/config';

import { Saver } from '../application/saver';
import { PlanetLibSQLRepository } from './implementations/libsql';

export const container = createContainer({
  injectionMode: 'PROXY',
});

container.register({
  libSQLClient: asValue(
    createClient({
      url: CONFIG.LIBSQL_DB_URI,
      authToken: CONFIG.LIBSQL_DB_TOKEN,
    }),
  ),
});

container.register({
  planetRepository: asClass(PlanetLibSQLRepository),
});

container.register({
  saver: asClass(Saver).singleton(),
});
