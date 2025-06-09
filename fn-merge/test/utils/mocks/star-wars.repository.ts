import { SWPlanet } from 'src/domain/models/star-wars';
import { StarWarsRepository } from 'src/domain/repositories/star-wars';

export class StarWarsMockRepository implements StarWarsRepository {
  getPlanet(externalId: string): Promise<SWPlanet | null> {
    if (externalId === '1') {
      return Promise.resolve({
        id: '1',
        name: 'Tatooine',
        coordinate: { x: 34.0, y: -118.0 },
        population: 200000,
      });
    }

    if (externalId === '2') {
      return Promise.resolve({
        id: '2',
        name: 'Alderaan',
        coordinate: { x: 40.0, y: -120.0 },
        population: 5000000,
      });
    }

    return Promise.resolve(null);
  }
}
