import { strictEqual } from 'node:assert';
import { after, before, describe, it } from 'node:test';

import { Client, createClient } from '@libsql/client';
import { PlanetLibSQLRepository } from 'src/infrastructure/implementations/libsql';
import { countRows, dropDB, emptyDB, initDB } from 'test/utils/libsql';

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

  describe('find', () => {
    it('should return an array', async () => {
      const result = await repository.find({}, { limit: 10, page: 1 });

      strictEqual(Array.isArray(result), true);
    });

    it('should return planets with custom fields', async () => {
      const result = await repository.find({}, { limit: 10, page: 1 });

      strictEqual(result.length, 6);
      strictEqual(result[0].name, 'Earth');
      strictEqual(result[0].customFields.length, 2);

      strictEqual(result[0].customFields[0].key, 'climate');
      strictEqual(result[0].customFields[0].value, 'Temperate');
      strictEqual(result[0].customFields[1].key, 'continent');
      strictEqual(result[0].customFields[1].value, 'Asia');
    });

    it('should return empty array of custom fields when planet does not have custom fields', async () => {
      const result = await repository.find({}, { limit: 10, page: 1 });

      strictEqual(result.length > 1, true);
      strictEqual(result[1].name, 'Mars');
      strictEqual(result[1].customFields.length, 0);
    });

    it('should return paginated results', async () => {
      const first = await repository.find({}, { limit: 2, page: 1 });
      strictEqual(first.length, 2);

      const second = await repository.find({}, { limit: 3, page: 2 });
      strictEqual(second.length, 3);

      const third = await repository.find({}, { limit: 1, page: 3 });
      strictEqual(third.length, 1);

      const fourth = await repository.find({}, { limit: 2, page: 4 });
      strictEqual(fourth.length, 0);
    });

    it('should return empty array when no planets exist', async () => {
      await emptyDB(libSQLClient);

      const result = await repository.find({}, { limit: 10, page: 1 });

      strictEqual(result.length, 0);
      strictEqual(await countRows(libSQLClient, 'planets'), 0);
    });
  });
});
