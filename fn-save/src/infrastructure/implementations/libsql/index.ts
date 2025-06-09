import { Client } from '@libsql/client';
import { PlanetRepository } from 'src/domain/repository';
import { TryCatch } from 'src/helpers/decorators/try-catch';

const TABLE = {
  PLANETS: 'planets',
  PLANETS_CUSTOM_FIELDS: 'planets_custom_fields',
} as const;

export class PlanetLibSQLRepository implements PlanetRepository {
  #client: Client;

  constructor(dependencies: { libSQLClient: Client }) {
    this.#client = dependencies.libSQLClient;
  }

  @TryCatch
  async addCustomParams(id: string, params: Record<string, string>): Promise<void> {
    const query = `
      INSERT INTO ${TABLE.PLANETS_CUSTOM_FIELDS} (planet_id, key, value)
      VALUES ${Object.keys(params)
        .map(() => '(?, ?, ?)')
        .join(', ')}
      ON CONFLICT(planet_id, key) DO UPDATE SET value = excluded.value
    `;

    const values = Object.entries(params).flatMap(([key, value]) => [id, key, value]);

    await this.#client.execute(query, values);
  }
}
