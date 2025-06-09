import { WeatherRepository } from 'src/domain/repositories/weather';

export class WeatherMockRepository implements WeatherRepository {
  getByCoordinates(x: number, y: number): Promise<{ temperature: number; windSpeed: number }> {
    if (x === 1 && y === -1) {
      return Promise.resolve({ temperature: 32, windSpeed: 5 });
    }

    return Promise.resolve({ temperature: 20, windSpeed: 3 });
  }
}
