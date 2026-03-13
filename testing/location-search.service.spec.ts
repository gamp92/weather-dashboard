import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { LocationSearchService } from '../src/app/core/services/location-search.service';
import { OpenMeteoGeoResponse } from '../src/app/core/interfaces/location.interface';

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
});
