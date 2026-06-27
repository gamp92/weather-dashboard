import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeatherNewsComponent } from '../src/app/features/weather-news/weather-news.component';
import { NewsArticle } from '../src/app/core/interfaces/news.interface';

const MOCK_ARTICLES: NewsArticle[] = [
  { id: 'env/1', title: 'Storm warning issued', url: 'https://theguardian.com/1', publishedAt: '2026-01-01T12:00:00Z', section: 'Environment' },
  { id: 'env/2', title: 'Climate record broken', url: 'https://theguardian.com/2', publishedAt: '2026-01-02T08:00:00Z', section: 'Environment' },
];

const getEl = (fixture: ComponentFixture<WeatherNewsComponent>, selector: string): HTMLElement | null =>
  fixture.nativeElement.querySelector(selector);

const getAllEls = (fixture: ComponentFixture<WeatherNewsComponent>, selector: string): NodeListOf<HTMLElement> =>
  fixture.nativeElement.querySelectorAll(selector) as NodeListOf<HTMLElement>;

describe('WeatherNewsComponent', () => {
  let fixture: ComponentFixture<WeatherNewsComponent>;
  let component: WeatherNewsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeatherNewsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherNewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders nothing in initial empty state', () => {
    expect(getEl(fixture, '.news')).toBeNull();
    expect(getEl(fixture, '.news__error')).toBeNull();
  });

  it('shows loading spinner when loading is true', () => {
    component.loading = true;
    fixture.detectChanges();

    expect(getEl(fixture, '.news__spinner')).toBeTruthy();
    expect(getEl(fixture, '.news__loading-text')).toBeTruthy();
  });

  it('shows article list when articles are provided', () => {
    component.articles = MOCK_ARTICLES;
    fixture.detectChanges();

    const items = getAllEls(fixture, '.news__item');
    expect(items.length).toBe(2);
  });

  it('renders article titles as links', () => {
    component.articles = MOCK_ARTICLES;
    fixture.detectChanges();

    const links = getAllEls(fixture, '.news__link');
    expect(links[0].textContent?.trim()).toBe('Storm warning issued');
    expect(links[1].textContent?.trim()).toBe('Climate record broken');
  });

  it('links open in a new tab with noopener', () => {
    component.articles = MOCK_ARTICLES;
    fixture.detectChanges();

    const link = getEl(fixture, '.news__link') as HTMLAnchorElement;
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
  });

  it('shows attribution text', () => {
    component.articles = MOCK_ARTICLES;
    fixture.detectChanges();

    expect(getEl(fixture, '.news__attribution')?.textContent).toContain('The Guardian');
  });

  it('shows error message when error is set', () => {
    component.error = 'Something went wrong. Please try again.';
    fixture.detectChanges();

    expect(getEl(fixture, '.news__error')?.textContent?.trim()).toBe('Something went wrong. Please try again.');
  });

  it('hides article list when loading', () => {
    component.loading = true;
    fixture.detectChanges();

    expect(getEl(fixture, '.news__list')).toBeNull();
  });
});
