// ── Domain models ────────────────────────────────────────────────────────────

export interface WeatherLocation {
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly country: string;
  readonly timezone: string;
}

export interface GeolocationCoords {
  readonly latitude: number;
  readonly longitude: number;
}

export interface LocationState {
  readonly location: WeatherLocation | null;
  readonly searchResults: readonly WeatherLocation[];
  readonly searchLoading: boolean;
  readonly searchError: string | null;
}

// ── Open-Meteo Geocoding API response types ───────────────────────────────────

export interface OpenMeteoGeoResult {
  readonly id: number;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly country: string;
  readonly timezone: string;
}

export interface OpenMeteoGeoResponse {
  readonly results?: readonly OpenMeteoGeoResult[];
}
