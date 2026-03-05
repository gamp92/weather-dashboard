import {
  isValidCoords,
  isValidLatitude,
  isValidLongitude,
} from '../src/app/shared/utils/coordinate-validator.util';

describe('coordinate-validator.util', () => {
  describe('isValidLatitude', () => {
    it('accepts valid latitudes', () => {
      expect(isValidLatitude(0)).toBe(true);
      expect(isValidLatitude(90)).toBe(true);
      expect(isValidLatitude(-90)).toBe(true);
      expect(isValidLatitude(51.5074)).toBe(true);
    });

    it('rejects latitudes out of range', () => {
      expect(isValidLatitude(91)).toBe(false);
      expect(isValidLatitude(-91)).toBe(false);
      expect(isValidLatitude(180)).toBe(false);
    });

    it('rejects non-finite values', () => {
      expect(isValidLatitude(Infinity)).toBe(false);
      expect(isValidLatitude(-Infinity)).toBe(false);
      expect(isValidLatitude(NaN)).toBe(false);
    });
  });

  describe('isValidLongitude', () => {
    it('accepts valid longitudes', () => {
      expect(isValidLongitude(0)).toBe(true);
      expect(isValidLongitude(180)).toBe(true);
      expect(isValidLongitude(-180)).toBe(true);
      expect(isValidLongitude(-0.1278)).toBe(true);
    });

    it('rejects longitudes out of range', () => {
      expect(isValidLongitude(181)).toBe(false);
      expect(isValidLongitude(-181)).toBe(false);
    });

    it('rejects non-finite values', () => {
      expect(isValidLongitude(NaN)).toBe(false);
      expect(isValidLongitude(Infinity)).toBe(false);
    });
  });

  describe('isValidCoords', () => {
    it('accepts valid coordinate pairs', () => {
      expect(isValidCoords(51.5074, -0.1278)).toBe(true);
      expect(isValidCoords(0, 0)).toBe(true);
      expect(isValidCoords(-90, -180)).toBe(true);
      expect(isValidCoords(90, 180)).toBe(true);
    });

    it('rejects if either coordinate is invalid', () => {
      expect(isValidCoords(91, 0)).toBe(false);
      expect(isValidCoords(0, 181)).toBe(false);
      expect(isValidCoords(NaN, 0)).toBe(false);
      expect(isValidCoords(0, NaN)).toBe(false);
    });
  });
});
