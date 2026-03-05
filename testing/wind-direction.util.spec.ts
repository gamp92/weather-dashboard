import { degreeToCompass } from '../src/app/shared/utils/wind-direction.util';

describe('wind-direction.util', () => {
  describe('degreeToCompass', () => {
    it('returns N for 0 degrees', () => {
      expect(degreeToCompass(0)).toBe('N');
    });

    it('returns N for 360 degrees', () => {
      expect(degreeToCompass(360)).toBe('N');
    });

    it('returns E for 90 degrees', () => {
      expect(degreeToCompass(90)).toBe('E');
    });

    it('returns S for 180 degrees', () => {
      expect(degreeToCompass(180)).toBe('S');
    });

    it('returns W for 270 degrees', () => {
      expect(degreeToCompass(270)).toBe('W');
    });

    it('returns NE for 45 degrees', () => {
      expect(degreeToCompass(45)).toBe('NE');
    });

    it('handles negative degrees', () => {
      expect(degreeToCompass(-90)).toBe('W');
    });
  });
});
