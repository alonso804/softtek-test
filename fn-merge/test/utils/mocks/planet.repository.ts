import { Planet } from 'src/domain/models/planet';
import { PlanetRepository } from 'src/domain/repositories/planet';

export class PlanetMockRepository implements PlanetRepository {
  insert(_planet: Omit<Planet, 'customFields'>): Promise<{ id: string }> {
    return Promise.resolve({ id: 'mocked-id' });
  }

  getByExternalId(externalId: string): Promise<Omit<Planet, 'customFields'> | null> {
    if (externalId === '1') {
      return Promise.resolve({
        id: '1',
        name: 'Tatooine',
        coordinate: { x: 34.0, y: -118.0 },
        population: 200000,
        weather: {
          temperature: 32,
          windSpeed: 5,
        },
      });
    }

    return Promise.resolve(null);
  }
}
