// Validates geographic coordinate ranges before sending to external APIs.

const LAT_MIN = -90;
const LAT_MAX = 90;
const LON_MIN = -180;
const LON_MAX = 180;

const inRange = (value: number, min: number, max: number): boolean =>
  Number.isFinite(value) && value >= min && value <= max;

export const isValidLatitude = (lat: number): boolean =>
  inRange(lat, LAT_MIN, LAT_MAX);

export const isValidLongitude = (lon: number): boolean =>
  inRange(lon, LON_MIN, LON_MAX);

export const isValidCoords = (lat: number, lon: number): boolean =>
  isValidLatitude(lat) && isValidLongitude(lon);
