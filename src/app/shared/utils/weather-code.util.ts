export type WeatherTheme = 'sunny' | 'cloudy' | 'foggy' | 'rainy' | 'snowy' | 'stormy' | 'night';

export interface WeatherDescription {
  readonly label: string;
  readonly icon: string;
  readonly theme: WeatherTheme;
}

const WEATHER_CODE_MAP: Readonly<Record<number, WeatherDescription>> = {
  0:  { label: 'Clear Sky',       icon: '☀️',  theme: 'sunny'  },
  1:  { label: 'Mainly Clear',    icon: '🌤️', theme: 'sunny'  },
  2:  { label: 'Partly Cloudy',   icon: '⛅',  theme: 'cloudy' },
  3:  { label: 'Overcast',        icon: '☁️',  theme: 'cloudy' },
  45: { label: 'Foggy',           icon: '🌫️', theme: 'foggy'  },
  48: { label: 'Icy Fog',         icon: '🌫️', theme: 'foggy'  },
  51: { label: 'Light Drizzle',   icon: '🌦️', theme: 'rainy'  },
  53: { label: 'Drizzle',         icon: '🌦️', theme: 'rainy'  },
  55: { label: 'Heavy Drizzle',   icon: '🌧️', theme: 'rainy'  },
  61: { label: 'Light Rain',      icon: '🌧️', theme: 'rainy'  },
  63: { label: 'Rain',            icon: '🌧️', theme: 'rainy'  },
  65: { label: 'Heavy Rain',      icon: '🌧️', theme: 'rainy'  },
  71: { label: 'Light Snow',      icon: '🌨️', theme: 'snowy'  },
  73: { label: 'Snow',            icon: '❄️',  theme: 'snowy'  },
  75: { label: 'Heavy Snow',      icon: '❄️',  theme: 'snowy'  },
  80: { label: 'Rain Showers',    icon: '🌦️', theme: 'rainy'  },
  81: { label: 'Rain Showers',    icon: '🌧️', theme: 'rainy'  },
  82: { label: 'Heavy Showers',   icon: '⛈️', theme: 'stormy' },
  85: { label: 'Snow Showers',    icon: '🌨️', theme: 'snowy'  },
  86: { label: 'Heavy Snow',      icon: '❄️',  theme: 'snowy'  },
  95: { label: 'Thunderstorm',    icon: '⛈️', theme: 'stormy' },
  96: { label: 'Thunderstorm',    icon: '⛈️', theme: 'stormy' },
  99: { label: 'Thunderstorm',    icon: '⛈️', theme: 'stormy' },
} as const;

type NightOverride = Pick<WeatherDescription, 'icon' | 'theme'>;

const NIGHT_OVERRIDES: Readonly<Partial<Record<number, NightOverride>>> = {
  0: { icon: '🌙', theme: 'night' },
  1: { icon: '🌙', theme: 'night' },
  2: { icon: '🌙', theme: 'night' },
} as const;

const FALLBACK: WeatherDescription = { label: 'Unknown', icon: '❓', theme: 'cloudy' };

const nightOverride = (code: number, isDay: boolean): NightOverride | undefined =>
  isDay ? undefined : NIGHT_OVERRIDES[code];

export const getWeatherDescription = (code: number): WeatherDescription =>
  WEATHER_CODE_MAP[code] ?? FALLBACK;

export const getWeatherLabel = (code: number): string =>
  getWeatherDescription(code).label;

export const getWeatherIcon = (code: number, isDay = true): string =>
  nightOverride(code, isDay)?.icon ?? getWeatherDescription(code).icon;

export const getWeatherTheme = (code: number, isDay = true): WeatherTheme =>
  nightOverride(code, isDay)?.theme ?? getWeatherDescription(code).theme;
