import { randomInt } from 'node:crypto';

import { Planet } from 'src/domain/models/planet';
import { SWPlanet } from 'src/domain/models/star-wars';
import { Weather } from 'src/domain/models/weather';
import { PlanetRepository } from 'src/domain/repositories/planet';
import { StarWarsRepository } from 'src/domain/repositories/star-wars';
import { WeatherRepository } from 'src/domain/repositories/weather';
import { STATUS_CODE } from 'src/helpers/constants';
import { BaseError } from 'src/helpers/errors/base-error';
import { CacheUtils } from 'src/helpers/utils/cache';

export class Merger {
  #planetRepository: PlanetRepository;
  #starWarsRepository: StarWarsRepository;
  #weatherRepository: WeatherRepository;
  #cacheUtils: CacheUtils;

  constructor(dependencies: {
    planetRepository: PlanetRepository;
    starWarsRepository: StarWarsRepository;
    weatherRepository: WeatherRepository;
    cacheUtils: CacheUtils;
  }) {
    this.#planetRepository = dependencies.planetRepository;
    this.#starWarsRepository = dependencies.starWarsRepository;
    this.#weatherRepository = dependencies.weatherRepository;
    this.#cacheUtils = dependencies.cacheUtils;
  }

  async run(): Promise<Omit<Planet, 'customFields'>> {
    const randomId = String(randomInt(1, 61));

    const existingPlanet = await this.#planetRepository.getByExternalId(randomId);

    if (existingPlanet) {
      console.log(`Planet with ID ${randomId} already exists in the database.`);

      return {
        id: existingPlanet.id,
        name: existingPlanet.name,
        coordinate: existingPlanet.coordinate,
        population: existingPlanet.population,
        weather: existingPlanet.weather,
      };
    }

    const swPlanet: SWPlanet | null = await this.#cacheUtils.findOrSet(
      { key: `star-wars-planet:${randomId}`, ttl: { min: 30 } },
      async () => this.#starWarsRepository.getPlanet(randomId),
    );

    if (!swPlanet) {
      throw new BaseError(
        STATUS_CODE.NOT_FOUND_404,
        `Planet with ID ${randomId} not found in Star Wars API.`,
      );
    }

    const weather: Weather = await this.#cacheUtils.findOrSet(
      { key: `weather-planet:${swPlanet.id}`, ttl: { min: 30 } },
      async () =>
        this.#weatherRepository.getByCoordinates(swPlanet.coordinate.x, swPlanet.coordinate.y),
    );

    const planet = Object.assign(swPlanet, { weather });

    const response = await this.#planetRepository.insert(planet);

    return {
      ...planet,
      id: response.id,
    };
  }
}
