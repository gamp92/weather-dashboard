import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { NewsService } from '../src/app/core/services/news.service';
import { NEWS_CONFIG, NewsArticle } from '../src/app/core/interfaces/news.interface';

const TEST_ENDPOINT = '/api/news';

const MOCK_ARTICLES: NewsArticle[] = [
  { id: 'env/1', title: 'Storm warning issued', url: 'https://theguardian.com/1', publishedAt: '2026-01-01T12:00:00Z', section: 'Environment' },
  { id: 'env/2', title: 'Climate record broken', url: 'https://theguardian.com/2', publishedAt: '2026-01-02T08:00:00Z', section: 'Environment' },
];

const flushArticles = (httpMock: HttpTestingController): void => {
  httpMock.expectOne(r => r.url.startsWith(TEST_ENDPOINT)).flush({ articles: MOCK_ARTICLES });
};

describe('NewsService — no config provided', () => {
  let service: NewsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(NewsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('does nothing when NEWS_CONFIG is not provided', () => {
    service.loadForLocation('London');
    httpMock.expectNone(() => true);
    expect(service.loading()).toBe(false);
  });
});

describe('NewsService — empty endpoint', () => {
  let service: NewsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NEWS_CONFIG, useValue: { endpoint: '' } },
      ],
    });
    service = TestBed.inject(NewsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('does nothing when endpoint is empty string', () => {
    service.loadForLocation('London');
    httpMock.expectNone(() => true);
    expect(service.loading()).toBe(false);
  });
});

describe('NewsService', () => {
  let service: NewsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NEWS_CONFIG, useValue: { endpoint: TEST_ENDPOINT } },
      ],
    });
    service = TestBed.inject(NewsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts with empty articles, no loading, no error', () => {
    expect(service.articles()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('sets loading true immediately when loadForLocation is called', () => {
    service.loadForLocation('London');
    expect(service.loading()).toBe(true);
    flushArticles(httpMock);
  });

  it('populates articles and clears loading on success', () => {
    service.loadForLocation('London');
    flushArticles(httpMock);

    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.articles()).toEqual(MOCK_ARTICLES);
  });

  it('sends GET request with encoded location query param', () => {
    service.loadForLocation('New York');
    const req = httpMock.expectOne(r => r.url.startsWith(TEST_ENDPOINT));
    expect(req.request.method).toBe('GET');
    expect(req.request.urlWithParams).toContain('location=New%20York');
    req.flush({ articles: [] });
  });

  it('sets a safe error message on HTTP failure', () => {
    service.loadForLocation('London');
    httpMock.expectOne(r => r.url.startsWith(TEST_ENDPOINT)).error(new ProgressEvent('error'));

    expect(service.loading()).toBe(false);
    expect(service.error()).toBeTruthy();
    expect(service.articles()).toEqual([]);
  });

  it('does not expose raw error details in the error signal', () => {
    service.loadForLocation('London');
    httpMock
      .expectOne(r => r.url.startsWith(TEST_ENDPOINT))
      .flush('', { status: 401, statusText: 'Unauthorized' });

    const err = service.error() ?? '';
    expect(err).not.toContain('Unauthorized');
    expect(err).not.toContain('401');
    expect(err.length).toBeGreaterThan(0);
  });

  it('cancels first in-flight request when loadForLocation is called again (switchMap)', () => {
    service.loadForLocation('London');
    service.loadForLocation('Paris');

    const reqs = httpMock.match(r => r.url.startsWith(TEST_ENDPOINT));
    expect(reqs.length).toBe(2);
    expect(reqs[0].cancelled).toBe(true);
    reqs[1].flush({ articles: MOCK_ARTICLES });
    expect(service.articles()).toEqual(MOCK_ARTICLES);
  });
});
