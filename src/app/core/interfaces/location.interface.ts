// ── Domain models ────────────────────────────────────────────────────────────

export interface WeatherLocation {
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly country: string;
  readonly timezone: string;
  readonly admin1?: string;
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

// ── BigDataCloud Reverse Geocoding API response type ─────────────────────────

export interface BigDataCloudResponse {
  readonly city: string;
  readonly principalSubdivision: string;
  readonly countryName: string;
}

// ── Open-Meteo Geocoding API response types ───────────────────────────────────

export interface OpenMeteoGeoResult {
  readonly id: number;
  readonly name: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly country: string;
  readonly timezone: string;
  readonly admin1?: string;
  readonly population?: number;
}

export interface OpenMeteoGeoResponse {
  readonly results?: readonly OpenMeteoGeoResult[];
}
