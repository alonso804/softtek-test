import { SWPlanet } from '../models/star-wars';

export interface StarWarsRepository {
  getPlanet(id: string): Promise<SWPlanet | null>;
}
