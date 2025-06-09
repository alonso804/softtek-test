import { Client } from '@libsql/client';
import { Planet } from 'src/domain/model';
import { PlanetRepository } from 'src/domain/repository';
import { TryCatch } from 'src/helpers/decorators/try-catch';
import { ISODate, Pagination } from 'src/helpers/types';

const TABLE = {
  PLANETS: 'planets',
  PLANETS_CUSTOM_FIELDS: 'planets_custom_fields',
} as const;

type PlanetSchema = {
  id: string;
  name: string;
  coordinate_x: number;
  coordinate_y: number;
  temperature: number;
  wind_speed: number;
  population: number;
  external_id: string;
  created_at: ISODate;
  updated_at: ISODate;
};

export class PlanetLibSQLRepository implements PlanetRepository {
  #client: Client;

  constructor(dependencies: { libSQLClient: Client }) {
    this.#client = dependencies.libSQLClient;
  }

  @TryCatch
  async find(_filter: Record<string, unknown>, { limit, page }: Pagination): Promise<Planet[]> {
    const query = `
      SELECT p.*, 
             json_group_array(json_object('key', cf.key, 'value', cf.value)) AS custom_fields
      FROM ${TABLE.PLANETS} p
      LEFT JOIN ${TABLE.PLANETS_CUSTOM_FIELDS} cf ON p.id = cf.planet_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT :limit OFFSET :offset;
    `;

    const offset = (page - 1) * limit;

    const response = await this.#client.execute(query, {
      limit,
      offset,
    });

    const planets = response.rows as unknown as (PlanetSchema & { custom_fields: string })[];

    return planets.map((planet) => {
      const customFields = planet.custom_fields
        ? (JSON.parse(planet.custom_fields) as Record<string, string>[])
        : [];

      const isEmpty = customFields.length === 0 || (!customFields[0].key && !customFields[0].value);

      return {
        id: planet.id,
        name: planet.name,
        coordinate: {
          x: planet.coordinate_x,
          y: planet.coordinate_y,
        },
        weather: {
          temperature: planet.temperature,
          windSpeed: planet.wind_speed,
        },
        population: planet.population,
        externalId: planet.external_id,
        createdAt: planet.created_at,
        updatedAt: planet.updated_at,
        customFields: isEmpty ? [] : customFields,
      };
    });
  }
}
