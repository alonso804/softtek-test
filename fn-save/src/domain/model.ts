export type Planet = {
  id: string;
  name: string;
  coordinate: {
    x: number;
    y: number;
  };
  population: number;
  weather: {
    temperature: number;
    windSpeed: number;
  };
  customParams: Record<string, unknown>[];
};
