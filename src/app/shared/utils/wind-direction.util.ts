const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
] as const;

export type CompassPoint = (typeof COMPASS_POINTS)[number];

const normalise = (degrees: number): number =>
  ((degrees % 360) + 360) % 360;

export const degreeToCompass = (degrees: number): CompassPoint =>
  COMPASS_POINTS[Math.round(normalise(degrees) / 22.5) % 16];
