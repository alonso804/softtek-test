import { Client } from '@libsql/client';
import { Planet } from 'src/domain/models/planet';
import { PlanetRepository } from 'src/domain/repositories/planet';
import { STATUS_CODE } from 'src/helpers/constants';
import { TryCatch } from 'src/helpers/decorators/try-catch';
import { SQLError } from 'src/helpers/errors/sql';
import { ISODate } from 'src/helpers/types';

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
  async insert(planet: Omit<Planet, 'customFields'>): Promise<{ id: string }> {
    const response = await this.#client.execute({
      sql: `
      INSERT INTO ${TABLE.PLANETS} (
        name, coordinate_x, coordinate_y,
        temperature, wind_speed, population, external_id
      ) VALUES (:name, :coordinateX, :coordinateY,
                :temperature, :wind_speed, :population, :externalId)
    `,
      args: {
        name: planet.name,
        coordinateX: planet.coordinate.x,
        coordinateY: planet.coordinate.y,
        temperature: planet.weather.temperature,
        wind_speed: planet.weather.windSpeed,
        population: planet.population,
        externalId: planet.id,
      },
    });

    if (response.rowsAffected === 0) {
      throw new SQLError(STATUS_CODE.BAD_REQUEST_400, `Failed to insert planet: ${planet.name}`);
    }

    return { id: String(response.lastInsertRowid) };
  }

  @TryCatch
  async getByExternalId(externalId: string): Promise<Omit<Planet, 'customFields'> | null> {
    const response = await this.#client.execute({
      sql: `
      SELECT * FROM ${TABLE.PLANETS}
      WHERE external_id = :externalId
    `,
      args: { externalId },
    });

    if (response.rows.length === 0) {
      return null;
    }

    const planetData = response.rows[0] as unknown as PlanetSchema;

    return {
      id: String(planetData.external_id),
      name: planetData.name,
      coordinate: {
        x: planetData.coordinate_x,
        y: planetData.coordinate_y,
      },
      weather: {
        temperature: planetData.temperature,
        windSpeed: planetData.wind_speed,
      },
      population: planetData.population,
    };
  }
}
