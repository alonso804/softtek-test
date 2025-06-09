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
  customFields: { key: string; value: string }[];
};
