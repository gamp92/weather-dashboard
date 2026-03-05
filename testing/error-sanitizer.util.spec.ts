import { sanitizeError } from '../src/app/shared/utils/error-sanitizer.util';

describe('error-sanitizer.util', () => {
  describe('sanitizeError', () => {
    it('maps "Failed to fetch" to a safe message', () => {
      const result = sanitizeError('Failed to fetch');
      expect(result).toBe('Unable to reach the service. Check your connection.');
      expect(result).not.toContain('fetch');
    });

    it('maps Http failure response to a safe message', () => {
      const result = sanitizeError('Http failure response for https://api.open-meteo.com: 500 Internal Server Error');
      expect(result).toBe('Weather service is temporarily unavailable.');
      expect(result).not.toContain('open-meteo');
      expect(result).not.toContain('500');
    });

    it('maps 429 status to a safe message', () => {
      const result = sanitizeError('Http failure response for https://api.open-meteo.com: 429 Too Many Requests');
      expect(result).toBe('Too many requests. Please wait a moment.');
    });

    it('maps PERMISSION_DENIED to a safe geolocation message', () => {
      const result = sanitizeError('PERMISSION_DENIED: User denied Geolocation');
      expect(result).toBe('Location access denied. Please search for a city manually.');
      expect(result).not.toContain('Geolocation');
    });

    it('maps POSITION_UNAVAILABLE to a safe message', () => {
      const result = sanitizeError('POSITION_UNAVAILABLE');
      expect(result).toBe('Your location could not be determined.');
    });

    it('returns generic message for unknown errors', () => {
      const result = sanitizeError('TypeError: Cannot read properties of undefined');
      expect(result).toBe('Something went wrong. Please try again.');
      expect(result).not.toContain('TypeError');
      expect(result).not.toContain('undefined');
    });

    it('never returns an empty string', () => {
      expect(sanitizeError('')).toBeTruthy();
      expect(sanitizeError('   ')).toBeTruthy();
    });

    it('never exposes stack trace fragments', () => {
      const result = sanitizeError('at Object.fetchWeather (weather.service.ts:91)');
      expect(result).not.toContain('weather.service');
      expect(result).not.toContain('.ts:');
    });
  });
});
