export interface PlanetRepository {
  addCustomParams(id: string, params: Record<string, string>): Promise<void>;
}
