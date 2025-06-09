import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { createClient } from '@libsql/client';
import { asClass, asValue, createContainer } from 'awilix';
import { Merger } from 'src/application/merger';
import { CONFIG } from 'src/config';
import { CacheDynamoDbUtils } from 'src/helpers/utils/cache/dynamodb';

import { PlanetLibSQLRepository } from './implementations/planet/libsql';
import { StarWarsSwapiInfoRepository } from './implementations/star-wars';
import { WeatherMeteoRepository } from './implementations/weather';

export const container = createContainer({
  injectionMode: 'PROXY',
});

container.register({
  dynamoDBClient: asValue(
    DynamoDBDocumentClient.from(
      new DynamoDBClient(
        CONFIG.APP_ENV === 'local'
          ? {
              region: CONFIG.AWS_REGION,
              credentials: {
                accessKeyId: CONFIG.AWS_ACCESS_KEY,
                secretAccessKey: CONFIG.AWS_SECRET_ACCESS_KEY,
              },
            }
          : {},
      ),
    ),
  ),
  libSQLClient: asValue(
    createClient({
      url: CONFIG.LIBSQL_DB_URI,
      authToken: CONFIG.LIBSQL_DB_TOKEN,
    }),
  ),
});

container.register({
  cacheUtils: asClass(CacheDynamoDbUtils).singleton(),
});

container.register({
  planetRepository: asClass(PlanetLibSQLRepository),
  starWarsRepository: asClass(StarWarsSwapiInfoRepository),
  weatherRepository: asClass(WeatherMeteoRepository),
});

container.register({
  merger: asClass(Merger),
});
