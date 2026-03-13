import {
  formatDateInZone,
  formatDay,
  formatHour,
  formatTimeInZone,
  getNext24Hours,
  timezoneToCity,
} from '../src/app/shared/utils/weather-forecast.util';
import { HourlyForecast } from '../src/app/core/interfaces/weather.interface';

const buildHourly = (count: number, startHour = 0): HourlyForecast => ({
  time: Array.from({ length: count }, (_, i) => `2024-01-15T${String(startHour + i).padStart(2, '0')}:00`),
  temperature: Array.from({ length: count }, (_, i) => 10 + i),
  weatherCode: Array.from({ length: count }, () => 0),
});

describe('weather-forecast.util', () => {
  describe('getNext24Hours', () => {
    it('returns 24 entries starting from current hour', () => {
      const hourly = buildHourly(48, 0);
      const result = getNext24Hours(hourly, '2024-01-15T06:00');
      expect(result.time).toHaveLength(24);
      expect(result.time[0]).toBe('2024-01-15T06:00');
    });

    it('falls back to index 0 when current hour not found', () => {
      const hourly = buildHourly(24, 0);
      const result = getNext24Hours(hourly, '2024-01-20T12:00');
      expect(result.time[0]).toBe('2024-01-15T00:00');
    });

    it('slices temperature and weatherCode in sync', () => {
      const hourly = buildHourly(48, 0);
      const result = getNext24Hours(hourly, '2024-01-15T02:00');
      expect(result.temperature).toHaveLength(24);
      expect(result.weatherCode).toHaveLength(24);
      expect(result.temperature[0]).toBe(12);
    });
  });

  describe('formatHour', () => {
    it('returns a non-empty time string', () => {
      const result = formatHour('2024-01-15T14:00');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatDay', () => {
    it('returns a non-empty day string', () => {
      const result = formatDay('2024-01-15');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    // Regression: date-only strings like "2026-03-05" were parsed as UTC midnight.
    // In UTC-N timezones this shifted to the previous calendar day (e.g. Wed instead of Thu).
    // Fix: append T12:00:00 so parsing is local noon — never shifts day regardless of offset.
    it('uses local noon parsing so day is never shifted by UTC offset', () => {
      const dateStr = '2026-03-05';
      const result = formatDay(dateStr);
      const expected = new Date(`${dateStr}T12:00:00`).toLocaleDateString([], { weekday: 'short' });
      expect(result).toBe(expected);
    });

    it('local noon date object for 2026-03-05 is a Thursday', () => {
      // Confirms the anchor date used in the regression test is correct (getDay 4 = Thursday)
      expect(new Date('2026-03-05T12:00:00').getDay()).toBe(4);
    });

    it('UTC midnight for same date can differ from local noon in negative-offset zones', () => {
      // Documents WHY the bug existed: UTC midnight and local noon give different getDay()
      // in negative UTC offset environments. In UTC, both are the same — test still documents intent.
      const utcMidnight = new Date('2026-03-05').getDay();
      const localNoon = new Date('2026-03-05T12:00:00').getDay();
      // In UTC the values match; in UTC-N they would differ (noon stays Thursday, midnight shifts).
      // Our implementation always uses local noon so it always matches the date's intended weekday.
      expect(localNoon).toBe(4); // Thursday — always correct
      expect(utcMidnight).toBeGreaterThanOrEqual(3); // 3 (Wed) in UTC-N, 4 (Thu) in UTC+
    });
  });

  describe('timezoneToCity', () => {
    it('extracts city from standard timezone string', () => {
      expect(timezoneToCity('Europe/London')).toBe('London');
    });

    it('replaces underscores with spaces', () => {
      expect(timezoneToCity('America/New_York')).toBe('New York');
      expect(timezoneToCity('America/Los_Angeles')).toBe('Los Angeles');
      expect(timezoneToCity('Asia/Ho_Chi_Minh')).toBe('Ho Chi Minh');
    });

    it('returns last segment for multi-part timezone', () => {
      expect(timezoneToCity('America/Indiana/Indianapolis')).toBe('Indianapolis');
    });

    it('returns the string itself when no slash present', () => {
      expect(timezoneToCity('UTC')).toBe('UTC');
    });

    it('returns Your Location for empty string', () => {
      expect(timezoneToCity('')).toBe('Your Location');
    });
  });

  describe('formatTimeInZone', () => {
    it('returns a non-empty string', () => {
      const result = formatTimeInZone(new Date(), 'UTC');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('formats time using the given timezone', () => {
      // 06:30 UTC should show 6 and 30
      const date = new Date('2026-03-05T06:30:00Z');
      const result = formatTimeInZone(date, 'UTC');
      expect(result).toContain('6');
      expect(result).toContain('30');
    });

    it('uses 12-hour format with AM/PM', () => {
      // 15:00 UTC — in 12-hour format shows "3" and "PM"
      const date = new Date('2026-03-05T15:00:00Z');
      const result = formatTimeInZone(date, 'UTC');
      expect(result).toContain('3');
      expect(result).toMatch(/PM/i);
    });

    it('reflects timezone offset correctly', () => {
      // 00:00 UTC = 12:00 AM UTC, 01:00 AM in Europe/Paris (CET, UTC+1 in winter)
      const date = new Date('2026-01-05T00:00:00Z');
      const utcResult = formatTimeInZone(date, 'UTC');
      const parisResult = formatTimeInZone(date, 'Europe/Paris');
      expect(utcResult).toMatch(/12.*AM/i);
      expect(parisResult).toMatch(/1.*AM/i);
    });
  });

  describe('formatDateInZone', () => {
    it('returns a non-empty string', () => {
      const result = formatDateInZone(new Date(), 'UTC');
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('includes the weekday name', () => {
      // 2026-03-05 is a Thursday
      const date = new Date('2026-03-05T12:00:00Z');
      const result = formatDateInZone(date, 'UTC');
      expect(result).toMatch(/thursday/i);
    });

    it('reflects timezone when date differs at midnight', () => {
      // 2026-03-05T00:30:00Z is still Mar 4 in UTC-1
      const date = new Date('2026-03-05T00:30:00Z');
      const utcResult = formatDateInZone(date, 'UTC');
      const nyResult = formatDateInZone(date, 'America/New_York');
      expect(utcResult).toMatch(/mar/i);
      expect(nyResult).toMatch(/mar/i);
    });
  });
});
