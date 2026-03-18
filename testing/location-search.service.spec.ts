import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LocationSearchService } from '../src/app/core/services/location-search.service';
import { BigDataCloudResponse, GeolocationCoords, OpenMeteoGeoResponse } from '../src/app/core/interfaces/location.interface';

const mockReverseResponse: BigDataCloudResponse = {
  city: 'Karachi',
  principalSubdivision: 'Sindh',
  countryName: 'Pakistan',
};

const mockCoords: GeolocationCoords = { latitude: 24.8, longitude: 67.0 };

const mockGeoResponse: OpenMeteoGeoResponse = {
  results: [
    { id: 1, name: 'London', latitude: 51.5, longitude: -0.12, country: 'United Kingdom', timezone: 'Europe/London' },
    { id: 2, name: 'London', latitude: 42.9, longitude: -81.2, country: 'Canada', timezone: 'America/Toronto' },
  ],
};

describe('LocationSearchService', () => {
  let service: LocationSearchService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(LocationSearchService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts with empty state', () => {
    expect(service.location()).toBeNull();
    expect(service.searchResults()).toHaveLength(0);
    expect(service.searchLoading()).toBe(false);
  });

  it('sets loading when search is called', fakeAsync(() => {
    service.search('London');
    expect(service.searchLoading()).toBe(true);
    tick(300);
    httpMock.expectOne(req => req.url.includes('geocoding-api')).flush(mockGeoResponse);
  }));

  it('populates results after debounce', fakeAsync(() => {
    service.search('London');
    tick(300);
    httpMock.expectOne(req => req.url.includes('geocoding-api')).flush(mockGeoResponse);
    expect(service.searchResults()).toHaveLength(2);
    expect(service.searchResults()[0].name).toBe('London');
  }));

  it('handles empty results gracefully', fakeAsync(() => {
    service.search('zzz');
    tick(300);
    httpMock.expectOne(req => req.url.includes('geocoding-api')).flush({});
    expect(service.searchResults()).toHaveLength(0);
  }));

  it('selectLocation updates location and clears results', fakeAsync(() => {
    service.search('London');
    tick(300);
    httpMock.expectOne(req => req.url.includes('geocoding-api')).flush(mockGeoResponse);

    const location = service.searchResults()[0];
    service.selectLocation(location);
    expect(service.location()).toEqual(location);
    expect(service.searchResults()).toHaveLength(0);
  }));

  it('reverseGeocode returns a WeatherLocation with city name', fakeAsync(() => {
    let result = service.location();
    service.reverseGeocode(mockCoords).subscribe(loc => { result = loc; });
    httpMock.expectOne(req => req.url.includes('bigdatacloud')).flush(mockReverseResponse);
    expect(result?.name).toBe('Karachi');
    expect(result?.country).toBe('Pakistan');
    expect(result?.latitude).toBe(24.8);
  }));

  it('reverseGeocode falls back to principalSubdivision when city is empty', fakeAsync(() => {
    let result = service.location();
    const noCity: BigDataCloudResponse = { city: '', principalSubdivision: 'Sindh', countryName: 'Pakistan' };
    service.reverseGeocode(mockCoords).subscribe(loc => { result = loc; });
    httpMock.expectOne(req => req.url.includes('bigdatacloud')).flush(noCity);
    expect(result?.name).toBe('Sindh');
  }));

  it('setLocationFromCoords updates location signal', fakeAsync(() => {
    service.setLocationFromCoords(mockCoords);
    httpMock.expectOne(req => req.url.includes('bigdatacloud')).flush(mockReverseResponse);
    expect(service.location()?.name).toBe('Karachi');
  }));

  it('setLocationFromCoords silently ignores errors', fakeAsync(() => {
    service.setLocationFromCoords(mockCoords);
    httpMock.expectOne(req => req.url.includes('bigdatacloud'))
      .flush('', { status: 500, statusText: 'Server Error' });
    expect(service.location()).toBeNull();
  }));
});
