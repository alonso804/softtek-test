/* eslint-disable @typescript-eslint/no-require-imports */
import { strictEqual } from 'node:assert';
import { afterEach, before, describe, it, mock } from 'node:test';

import { Merger } from 'src/application/merger';
import { MockedCacheUtils } from 'test/utils/mocks/cache.util';
import { PlanetMockRepository } from 'test/utils/mocks/planet.repository';
import { StarWarsMockRepository } from 'test/utils/mocks/star-wars.repository';
import { WeatherMockRepository } from 'test/utils/mocks/weather.repository';

let merger: Merger;

const EXIST_PLANET_ID = '1';

describe('Planet LibSQL Repository', () => {
  before(async () => {
    merger = new Merger({
      planetRepository: new PlanetMockRepository(),
      starWarsRepository: new StarWarsMockRepository(),
      weatherRepository: new WeatherMockRepository(),
      cacheUtils: new MockedCacheUtils(),
    });
  });

  afterEach(() => {
    mock.reset();
  });

  it('should return an existing planet from the database', async () => {
    const findOrSetSpy = mock.method(MockedCacheUtils.prototype, 'findOrSet');

    mock.method(require('node:crypto'), 'randomInt', () => EXIST_PLANET_ID);

    await merger.run();

    strictEqual(findOrSetSpy.mock.callCount(), 0);
  });

  it('should fetch a planet from Star Wars API and weather data', async () => {
    const getByExternalIdSpy = mock.method(PlanetMockRepository.prototype, 'getByExternalId');
    const findOrSetSpy = mock.method(MockedCacheUtils.prototype, 'findOrSet');
    const getPlanetSpy = mock.method(StarWarsMockRepository.prototype, 'getPlanet');
    const getByCoordinatesSpy = mock.method(WeatherMockRepository.prototype, 'getByCoordinates');

    mock.method(require('node:crypto'), 'randomInt', () => '2');

    await merger.run();

    console.log(findOrSetSpy.mock.callCount());

    strictEqual(getByExternalIdSpy.mock.callCount(), 1, 'getByExternalId should be called once');
    strictEqual(getPlanetSpy.mock.callCount(), 1, 'getPlanet should be called once');
    strictEqual(getByCoordinatesSpy.mock.callCount(), 1, 'getByCoordinates should be called once');
    strictEqual(findOrSetSpy.mock.callCount(), 2, 'findOrSet should be called twice');
  });
});
