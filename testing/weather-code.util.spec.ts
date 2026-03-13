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
    it('returns sun icon for clear sky during the day', () => {
      expect(getWeatherIcon(0, true)).toBe('☀️');
    });

    it('returns moon icon for clear sky at night (code 0)', () => {
      expect(getWeatherIcon(0, false)).toBe('🌙');
    });

    it('returns moon icon for mainly clear at night (code 1)', () => {
      expect(getWeatherIcon(1, false)).toBe('🌙');
    });

    it('returns moon icon for partly cloudy at night (code 2)', () => {
      expect(getWeatherIcon(2, false)).toBe('🌙');
    });

    it('defaults to daytime icon when isDay is omitted', () => {
      expect(getWeatherIcon(0)).toBe('☀️');
    });

    it('returns rain icon at night (no night override for rain)', () => {
      expect(getWeatherIcon(63, false)).toBe('🌧️');
    });

    it('returns rain icon for known code', () => {
      expect(getWeatherIcon(63)).toBe('🌧️');
    });
  });

  describe('getWeatherTheme', () => {
    it('returns sunny theme for clear sky during the day', () => {
      expect(getWeatherTheme(0, true)).toBe('sunny');
    });

    it('returns night theme for clear sky at night (code 0)', () => {
      expect(getWeatherTheme(0, false)).toBe('night');
    });

    it('returns night theme for mainly clear at night (code 1)', () => {
      expect(getWeatherTheme(1, false)).toBe('night');
    });

    it('returns night theme for partly cloudy at night (code 2)', () => {
      expect(getWeatherTheme(2, false)).toBe('night');
    });

    it('defaults to daytime theme when isDay is omitted', () => {
      expect(getWeatherTheme(0)).toBe('sunny');
    });

    it('returns rainy theme at night (no night override for rain)', () => {
      expect(getWeatherTheme(61, false)).toBe('rainy');
    });

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
