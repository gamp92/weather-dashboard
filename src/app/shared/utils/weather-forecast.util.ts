import { HourlyForecast } from '../../core/interfaces/weather.interface';

const findHourIndex = (times: readonly string[], currentTime: string): number => {
  const hourPrefix = currentTime.substring(0, 13);
  const idx = times.findIndex(t => t.startsWith(hourPrefix));
  return idx >= 0 ? idx : 0;
};

const sliceHourly = (hourly: HourlyForecast, start: number): HourlyForecast => ({
  time: hourly.time.slice(start, start + 24),
  temperature: hourly.temperature.slice(start, start + 24),
  weatherCode: hourly.weatherCode.slice(start, start + 24),
});

export const getNext24Hours = (hourly: HourlyForecast, currentTime: string): HourlyForecast =>
  sliceHourly(hourly, findHourIndex(hourly.time, currentTime));

export const formatHour = (isoTime: string): string =>
  new Date(isoTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export const formatDay = (isoDate: string): string =>
  new Date(`${isoDate}T12:00:00`).toLocaleDateString([], { weekday: 'short' });

export const formatFullDate = (isoDate: string): string =>
  new Date(`${isoDate}T12:00:00`).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

export const timezoneToCity = (tz: string): string =>
  tz ? (tz.split('/').at(-1)?.replace(/_/g, ' ') ?? tz) : 'Your Location';

export const formatTimeInZone = (date: Date, timezone: string): string =>
  new Intl.DateTimeFormat([], {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
    hour12: true,
  }).format(date);

export const formatDateInZone = (date: Date, timezone: string): string =>
  new Intl.DateTimeFormat([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: timezone,
  }).format(date);
