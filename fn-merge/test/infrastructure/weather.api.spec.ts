import { strictEqual } from 'node:assert';
import { afterEach, before, describe, it, mock } from 'node:test';

import axios, { AxiosRequestHeaders } from 'axios';
import { STATUS_CODE } from 'src/helpers/constants';
import { FetchError } from 'src/helpers/errors/fetch-error';
import { WeatherMeteoRepository } from 'src/infrastructure/implementations/weather';

let repository: WeatherMeteoRepository;

describe('Planet LibSQL Repository', () => {
  before(async () => {
    repository = new WeatherMeteoRepository();
  });

  afterEach(() => {
    mock.reset();
  });

  describe('getByCoordinates', () => {
    it('should return weather data for valid coordinates', async () => {
      const lat = 40.7128;
      const lon = -74.006;

      const mockedResponse = {
        latitude: lat,
        longitude: lon,
        generationtime_ms: 100,
        utc_offset_seconds: 0,
        timezone: 'America/New_York',
        timezone_abbreviation: 'EST',
        elevation: 10,
        current_units: {
          time: 'iso8601',
          interval: '1h',
          temperature_2m: 'Celsius',
          wind_speed_10m: 'm/s',
        },
        current: {
          time: '2023-10-01T12:00:00Z',
          interval: 1,
          temperature_2m: 20,
          wind_speed_10m: 5,
        },
      };

      mock.method(axios, 'get', () =>
        Promise.resolve({
          data: mockedResponse,
        }),
      );

      const weather = await repository.getByCoordinates(lat, lon);

      strictEqual(weather.temperature, mockedResponse.current.temperature_2m);
      strictEqual(weather.windSpeed, mockedResponse.current.wind_speed_10m);
    });

    it('should handle errors gracefully', async () => {
      const lat = 100;
      const lon = -100;

      mock.method(axios, 'get', () =>
        Promise.reject(
          new axios.AxiosError(undefined, undefined, undefined, undefined, {
            status: STATUS_CODE.BAD_REQUEST_400,
            data: { detail: 'Not Found' },
            config: { headers: {} as AxiosRequestHeaders },
            headers: {},
            statusText: 'Not Found',
            request: {},
          }),
        ),
      );

      let result = null;

      try {
        result = await repository.getByCoordinates(lat, lon);
      } catch (error) {
        strictEqual(error instanceof FetchError, true);
        if (error instanceof FetchError) {
          strictEqual(error.status, STATUS_CODE.BAD_REQUEST_400);
        }
      }

      strictEqual(result, null);
    });
  });
});
