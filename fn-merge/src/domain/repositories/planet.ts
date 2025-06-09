import { Planet } from '../models/planet';

export interface PlanetRepository {
  insert(planet: Omit<Planet, 'customFields'>): Promise<{ id: string }>;

  getByExternalId(externalId: string): Promise<Omit<Planet, 'customFields'> | null>;
}
