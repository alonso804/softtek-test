import { strictEqual } from 'node:assert';
import { after, before, describe, it } from 'node:test';

import { Client, createClient } from '@libsql/client';
import { PlanetLibSQLRepository } from 'src/infrastructure/implementations/libsql';
import { dropDB, initDB } from 'test/utils/libsql';

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

  describe('addCustomParams', () => {
    it('should add custom parameters to a planet', async () => {
      const planetId = '1';
      const customParams = { key1: 'value1', key2: 'value2' };

      const { rows: initialRows } = await libSQLClient.execute(
        `SELECT COUNT(*) as count FROM planets_custom_fields WHERE planet_id = ?`,
        [planetId],
      );

      await repository.addCustomParams(planetId, customParams);

      const { rows } = await libSQLClient.execute(
        `SELECT * FROM planets_custom_fields WHERE planet_id = ?`,
        [planetId],
      );

      strictEqual(rows.length, Object.keys(customParams).length + (initialRows[0].count as number));

      const key1Index = rows.findIndex((row) => row.key === 'key1');
      const key2Index = rows.findIndex((row) => row.key === 'key2');

      strictEqual(rows[key1Index].key, 'key1');
      strictEqual(rows[key1Index].value, 'value1');
      strictEqual(rows[key2Index].key, 'key2');
      strictEqual(rows[key2Index].value, 'value2');
    });

    it('should update existing custom parameters', async () => {
      const planetId = '1';
      const customParams = { continent: 'Europe', climate: 'Temperate' };

      const { rows: rowsBefore } = await libSQLClient.execute(
        `SELECT * FROM planets_custom_fields WHERE planet_id = ?`,
        [planetId],
      );

      const beforeContinentIndex = rowsBefore.findIndex((row) => row.key === 'continent');
      strictEqual(rowsBefore[beforeContinentIndex].key, 'continent');
      strictEqual(rowsBefore[beforeContinentIndex].value !== customParams.continent, true);

      await repository.addCustomParams(planetId, customParams);

      const { rows: rowsAfter } = await libSQLClient.execute(
        `SELECT * FROM planets_custom_fields WHERE planet_id = ?`,
        [planetId],
      );

      const afterContinentIndex = rowsAfter.findIndex((row) => row.key === 'continent');
      const afterClimateIndex = rowsAfter.findIndex((row) => row.key === 'climate');

      strictEqual(rowsAfter[afterContinentIndex].key, 'continent');
      strictEqual(rowsAfter[afterContinentIndex].value, 'Europe');
      strictEqual(rowsAfter[afterClimateIndex].key, 'climate');
      strictEqual(rowsAfter[afterClimateIndex].value, 'Temperate');
    });
  });
});
