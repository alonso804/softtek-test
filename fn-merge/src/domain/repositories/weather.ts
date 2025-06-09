import { Weather } from '../models/weather';

export interface WeatherRepository {
  getByCoordinates(x: number, y: number): Promise<Weather>;
}
