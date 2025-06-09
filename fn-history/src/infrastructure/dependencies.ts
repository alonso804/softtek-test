import { createClient } from '@libsql/client';
import { asClass, asValue, createContainer } from 'awilix';
import { Getter } from 'src/application/getter';
import { CONFIG } from 'src/config';

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
  getter: asClass(Getter).singleton(),
});
