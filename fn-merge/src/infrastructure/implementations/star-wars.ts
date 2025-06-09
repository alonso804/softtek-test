import axios from 'axios';
import type { SWPlanet } from 'src/domain/models/star-wars';
import type { StarWarsRepository } from 'src/domain/repositories/star-wars';
import { STATUS_CODE } from 'src/helpers/constants';
import { TryCatch } from 'src/helpers/decorators/try-catch';
import type { ISODate, URI } from 'src/helpers/types';

/* API: https://swapi.info */

const BASE_URI = 'https://swapi.info/api';

type PlanetResponse = {
  name: string;
  rotation_period: string;
  orbital_period: string;
  diameter: string;
  climate: string;
  gravity: string;
  terrain: string;
  surface_water: string;
  population: string;
  residents: URI[];
  films: URI[];
  created: ISODate;
  edited: ISODate;
  url: string;
};

export class StarWarsSwapiInfoRepository implements StarWarsRepository {
  @TryCatch
  async getPlanet(id: string): Promise<SWPlanet | null> {
    try {
      console.log(`Fetching Star Wars API with ID: ${id}`);

      const { data: planet } = await axios.get<PlanetResponse>(`${BASE_URI}/planets/${id}`);

      const x = Number(planet.rotation_period);
      const y = Number(planet.orbital_period);

      const coordinate = {
        x: isNaN(x) ? 0 : x,
        y: isNaN(y) ? 0 : y,
      };

      const population = Number(planet.population);

      return {
        id,
        name: planet.name,
        coordinate,
        population: isNaN(population) ? 0 : population,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.status === STATUS_CODE.NOT_FOUND_404) {
          console.warn(`Planet with ID ${id} not found.`);

          return null;
        }
      }

      throw error;
    }
  }
}
