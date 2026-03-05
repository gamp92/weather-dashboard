import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import {
  LocationState,
  OpenMeteoGeoResponse,
  OpenMeteoGeoResult,
  WeatherLocation,
} from '../interfaces/location.interface';
import { sanitizeError } from '../../shared/utils/error-sanitizer.util';

const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const MAX_QUERY_LENGTH = 100;
const MIN_QUERY_LENGTH = 2;

const isSafeQuery = (query: string): boolean =>
  query.length >= MIN_QUERY_LENGTH && query.length <= MAX_QUERY_LENGTH;

const buildGeoUrl = (query: string): string =>
  `${GEO_API}?name=${encodeURIComponent(query)}&count=5&language=en&format=json`;

const mapResult = (r: OpenMeteoGeoResult): WeatherLocation => ({
  name: r.name,
  latitude: r.latitude,
  longitude: r.longitude,
  country: r.country,
  timezone: r.timezone,
});

const mapResponse = (r: OpenMeteoGeoResponse): WeatherLocation[] =>
  (r.results ?? []).map(mapResult);

@Injectable({ providedIn: 'root' })
export class LocationSearchService {
  private readonly http = inject(HttpClient);
  private readonly searchQuery$ = new Subject<string>();
  private readonly state = signal<LocationState>({
    location: null,
    searchResults: [],
    searchLoading: false,
    searchError: null,
  });

  readonly location = computed(() => this.state().location);
  readonly searchResults = computed(() => this.state().searchResults);
  readonly searchLoading = computed(() => this.state().searchLoading);
  readonly searchError = computed(() => this.state().searchError);

  constructor() {
    this.searchQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => this.http.get<OpenMeteoGeoResponse>(buildGeoUrl(q)).pipe(
        map(mapResponse)
      ))
    ).subscribe({
      next: results => this.state.update(s => ({ ...s, searchResults: results, searchLoading: false })),
      error: (e: Error) => this.state.update(s => ({ ...s, searchLoading: false, searchError: sanitizeError(e.message) })),
    });
  }

  search(query: string): void {
    if (!isSafeQuery(query)) return;
    this.state.update(s => ({ ...s, searchLoading: true, searchError: null }));
    this.searchQuery$.next(query);
  }

  selectLocation(location: WeatherLocation): void {
    this.state.update(s => ({ ...s, location, searchResults: [] }));
  }

  clearResults(): void {
    this.state.update(s => ({ ...s, searchResults: [] }));
  }
}
