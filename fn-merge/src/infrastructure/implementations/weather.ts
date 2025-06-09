import axios from 'axios';
import type { Weather } from 'src/domain/models/weather';
import type { WeatherRepository } from 'src/domain/repositories/weather';
import { TryCatch } from 'src/helpers/decorators/try-catch';
import type { ISODate } from 'src/helpers/types';

/* API: https://open-meteo.com/ */

const BASE_URI = 'https://api.open-meteo.com/v1/forecast';

type WeatherResponse = {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    wind_speed_10m: string;
  };
  current: {
    time: ISODate;
    interval: number;
    temperature_2m: number;
    wind_speed_10m: number;
  };
};

const LONGITUDE_LIMIT = 180;
const LATITUDE_LIMIT = 90;

export class WeatherMeteoRepository implements WeatherRepository {
  @TryCatch
  async getByCoordinates(x: number, y: number): Promise<Weather> {
    const { data: weather } = await axios.get<WeatherResponse>(`${BASE_URI}`, {
      params: {
        latitude: x % LATITUDE_LIMIT,
        longitude: y % LONGITUDE_LIMIT,
        current: 'temperature_2m,wind_speed_10m',
      },
    });

    return {
      temperature: weather.current.temperature_2m,
      windSpeed: weather.current.wind_speed_10m,
    };
  }
}
