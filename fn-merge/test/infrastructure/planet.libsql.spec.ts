import { strictEqual } from 'node:assert';
import { after, before, describe, it } from 'node:test';

import { Client, createClient } from '@libsql/client';
import { Planet } from 'src/domain/models/planet';
import { SQLError } from 'src/helpers/errors/sql';
import { PlanetLibSQLRepository } from 'src/infrastructure/implementations/planet/libsql';
import { countRows, dropDB, initDB } from 'test/utils/libsql';

let libSQLClient: Client;
let repository: PlanetLibSQLRepository;

describe('Planet LibSQL Repository', () => {
  before(async () => {
    libSQLClient = createClient({ url: ':memory:' });

    repository = new PlanetLibSQLRepository({
      libSQLClient,
    });

    await initDB(libSQLClient);
  });

  after(async () => {
    await dropDB(libSQLClient);
    libSQLClient.close();
  });

  describe('insert', () => {
    it('should insert a new planet', async () => {
      const planet = {
        name: 'Tattooine',
        coordinate: { x: 0, y: 0 },
        weather: { temperature: 15, windSpeed: 5 },
        population: 7800000000,
        id: 'tattooine-123',
      };

      const beforeCount = await countRows(libSQLClient, 'planets');

      await repository.insert(planet);

      const afterCount = await countRows(libSQLClient, 'planets');

      strictEqual(beforeCount + 1, afterCount);
    });

    it('should return last inserted id as string', async () => {
      const planet = {
        name: 'Endor',
        coordinate: { x: 1, y: 1 },
        weather: { temperature: 20, windSpeed: 10 },
        population: 1000000,
        id: 'endor-456',
      };

      const result = await repository.insert(planet);

      strictEqual(typeof result.id, 'string');
    });

    it('should throw an error if insertion fails', async () => {
      const planet = {
        name: null,
        coordinate: { x: 0, y: 0 },
        weather: { temperature: 15, windSpeed: 5 },
        population: 7800000000,
        id: 'invalid-planet',
      };

      let response = null;

      try {
        response = await repository.insert(planet as unknown as Omit<Planet, 'customParams'>);
      } catch (error) {
        strictEqual(error instanceof SQLError, true);
      }

      strictEqual(response, null);
    });
  });

  describe('getByExternalId', () => {
    it('should return a planet by external id', async () => {
      const planet = {
        name: 'Hoth',
        coordinate: { x: 2, y: 2 },
        weather: { temperature: -20, windSpeed: 15 },
        population: 100000,
        id: 'hoth-789',
      };

      await repository.insert(planet);

      const foundPlanet = await repository.getByExternalId(planet.id);

      strictEqual(foundPlanet !== null, true);
      strictEqual(foundPlanet?.name, planet.name);
      strictEqual(foundPlanet?.id, planet.id);
    });

    it('should return null if no planet is found', async () => {
      const foundPlanet = await repository.getByExternalId('non-existent-id');

      strictEqual(foundPlanet, null);
    });
  });
});
