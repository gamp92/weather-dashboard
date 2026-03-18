import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap, take } from 'rxjs/operators';
import {
  BigDataCloudResponse,
  GeolocationCoords,
  LocationState,
  OpenMeteoGeoResponse,
  OpenMeteoGeoResult,
  WeatherLocation,
} from '../interfaces/location.interface';
import { sanitizeError } from '../../shared/utils/error-sanitizer.util';

const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_GEO_API = 'https://api.bigdatacloud.net/data/reverse-geocode-client';
const MAX_QUERY_LENGTH = 100;
const MIN_QUERY_LENGTH = 2;

const isSafeQuery = (query: string): boolean =>
  query.length >= MIN_QUERY_LENGTH && query.length <= MAX_QUERY_LENGTH;

const buildGeoUrl = (query: string): string =>
  `${GEO_API}?name=${encodeURIComponent(query)}&count=10&language=en&format=json&fields=id,name,latitude,longitude,country,timezone,admin1,population`;

const mapResult = (r: OpenMeteoGeoResult): WeatherLocation => ({
  name: r.name,
  latitude: r.latitude,
  longitude: r.longitude,
  country: r.country,
  timezone: r.timezone,
  admin1: r.admin1,
});

const byPopulation = (a: OpenMeteoGeoResult, b: OpenMeteoGeoResult): number =>
  (b.population ?? 0) - (a.population ?? 0);

const buildReverseGeoUrl = (coords: GeolocationCoords): string =>
  `${REVERSE_GEO_API}?latitude=${String(coords.latitude)}&longitude=${String(coords.longitude)}&localityLanguage=en`;

const mapReverseResult = (r: BigDataCloudResponse, coords: GeolocationCoords): WeatherLocation => ({
  name: r.city || r.principalSubdivision || r.countryName,
  latitude: coords.latitude,
  longitude: coords.longitude,
  country: r.countryName,
  timezone: '',
  admin1: r.principalSubdivision,
});

const mapResponse = (r: OpenMeteoGeoResponse): WeatherLocation[] =>
  (r.results ?? []).slice().sort(byPopulation).slice(0, 5).map(mapResult);

@Injectable({ providedIn: 'root' })
export class LocationSearchService {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
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
    this.setupSearch();
  }

  private fetchLocations(q: string): Observable<WeatherLocation[]> {
    return this.http.get<OpenMeteoGeoResponse>(buildGeoUrl(q)).pipe(map(mapResponse));
  }

  private setupSearch(): void {
    this.searchQuery$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => this.fetchLocations(q)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({ next: r => { this.onResults(r); }, error: (e: Error) => { this.onError(e); } });
  }

  private onResults(results: WeatherLocation[]): void {
    this.state.update(s => ({ ...s, searchResults: results, searchLoading: false }));
  }

  private onError(e: Error): void {
    this.state.update(s => ({ ...s, searchLoading: false, searchError: sanitizeError(e.message) }));
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

  reverseGeocode(coords: GeolocationCoords): Observable<WeatherLocation> {
    return this.http.get<BigDataCloudResponse>(buildReverseGeoUrl(coords)).pipe(
      map(r => mapReverseResult(r, coords)),
    );
  }

  setLocationFromCoords(coords: GeolocationCoords): void {
    this.reverseGeocode(coords).pipe(take(1)).subscribe({
      next: loc => { this.selectLocation(loc); },
      error: () => { /* non-critical: weather still loads without city name */ },
    });
  }
}
