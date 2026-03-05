import {
  getWeatherDescription,
  getWeatherIcon,
  getWeatherLabel,
  getWeatherTheme,
} from '../src/app/shared/utils/weather-code.util';

describe('weather-code.util', () => {
  describe('getWeatherDescription', () => {
    it('returns correct description for clear sky (0)', () => {
      const result = getWeatherDescription(0);
      expect(result.label).toBe('Clear Sky');
      expect(result.icon).toBe('☀️');
      expect(result.theme).toBe('sunny');
    });

    it('returns correct description for thunderstorm (95)', () => {
      const result = getWeatherDescription(95);
      expect(result.theme).toBe('stormy');
    });

    it('returns fallback for unknown code', () => {
      const result = getWeatherDescription(999);
      expect(result.label).toBe('Unknown');
      expect(result.icon).toBe('❓');
      expect(result.theme).toBe('cloudy');
    });
  });

  describe('getWeatherLabel', () => {
    it('returns label for known code', () => {
      expect(getWeatherLabel(1)).toBe('Mainly Clear');
    });

    it('returns Unknown for unrecognised code', () => {
      expect(getWeatherLabel(-1)).toBe('Unknown');
    });
  });

  describe('getWeatherIcon', () => {
    it('returns icon for known code', () => {
      expect(getWeatherIcon(63)).toBe('🌧️');
    });
  });

  describe('getWeatherTheme', () => {
    it('maps rain codes to rainy theme', () => {
      expect(getWeatherTheme(61)).toBe('rainy');
      expect(getWeatherTheme(63)).toBe('rainy');
      expect(getWeatherTheme(65)).toBe('rainy');
    });

    it('maps snow codes to snowy theme', () => {
      expect(getWeatherTheme(71)).toBe('snowy');
      expect(getWeatherTheme(73)).toBe('snowy');
    });

    it('maps fog codes to foggy theme', () => {
      expect(getWeatherTheme(45)).toBe('foggy');
      expect(getWeatherTheme(48)).toBe('foggy');
    });
  });
});
