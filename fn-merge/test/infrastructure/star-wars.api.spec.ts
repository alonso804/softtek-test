import { strictEqual } from 'node:assert';
import { afterEach, before, describe, it, mock } from 'node:test';

import axios, { AxiosRequestHeaders } from 'axios';
import { STATUS_CODE } from 'src/helpers/constants';
import { StarWarsSwapiInfoRepository } from 'src/infrastructure/implementations/star-wars';

let repository: StarWarsSwapiInfoRepository;

describe('Planet LibSQL Repository', () => {
  before(async () => {
    repository = new StarWarsSwapiInfoRepository();
  });

  afterEach(() => {
    mock.reset();
  });

  describe('getPlanet', () => {
    it('should return a planet with valid ID', async () => {
      const id = '1';

      mock.method(axios, 'get', () =>
        Promise.resolve({
          data: {
            name: 'Tatooine',
            rotation_period: '23',
            orbital_period: '304',
            diameter: '10465',
            climate: 'arid',
            gravity: '1 standard',
            terrain: 'desert',
            surface_water: '1',
            population: '200000',
            residents: [],
            films: [],
            created: '2014-12-09T13:50:49.641000Z',
            edited: '2014-12-20T20:58:18.411000Z',
            url: `https://swapi.info/api/planets/${id}`,
          },
        }),
      );

      const planet = await repository.getPlanet(id);

      strictEqual(planet !== null, true);
      strictEqual(planet?.name, 'Tatooine');
    });

    it('should return a planet of type "SWPlanet" with valid ID', async () => {
      const id = '1';

      const mockedPlanet = {
        name: 'Tatooine',
        rotation_period: '23',
        orbital_period: '304',
        diameter: '10465',
        climate: 'arid',
        gravity: '1 standard',
        terrain: 'desert',
        surface_water: '1',
        population: '200000',
        residents: [],
        films: [],
        created: '2014-12-09T13:50:49.641000Z',
        edited: '2014-12-20T20:58:18.411000Z',
        url: `https://swapi.info/api/planets/${id}`,
      };

      mock.method(axios, 'get', () =>
        Promise.resolve({
          data: mockedPlanet,
        }),
      );

      const planet = await repository.getPlanet(id);

      strictEqual(planet !== null, true);
      strictEqual(planet?.id, id);
      strictEqual(planet?.name, mockedPlanet.name);
      strictEqual(planet?.coordinate.x, Number(mockedPlanet.rotation_period));
      strictEqual(planet?.coordinate.y, Number(mockedPlanet.orbital_period));
      strictEqual(planet?.population, Number(mockedPlanet.population));
    });

    it('should return null for non-existent planet ID', async () => {
      const id = '9999';

      mock.method(axios, 'get', () =>
        Promise.reject(
          new axios.AxiosError(undefined, undefined, undefined, undefined, {
            status: STATUS_CODE.NOT_FOUND_404,
            data: { detail: 'Not Found' },
            config: { headers: {} as AxiosRequestHeaders },
            headers: {},
            statusText: 'Not Found',
            request: {},
          }),
        ),
      );

      const planet = await repository.getPlanet(id);

      strictEqual(planet, null);
    });
  });
});
