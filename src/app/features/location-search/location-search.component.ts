import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { WeatherLocation } from '../../core/interfaces/location.interface';

@Component({
  selector: 'app-location-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './location-search.component.html',
  styleUrl: './location-search.component.scss',
})
export class LocationSearchComponent implements OnDestroy {
  @Input() results: readonly WeatherLocation[] = [];
  @Input() loading = false;

  @Output() readonly search = new EventEmitter<string>();
  @Output() readonly locationSelected = new EventEmitter<WeatherLocation>();
  @Output() readonly cleared = new EventEmitter<void>();

  @ViewChild('searchInput') private readonly searchInput!: ElementRef<HTMLInputElement>;

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  protected onInput(event: Event): void {
    const query = (event.target as HTMLInputElement).value.trim();
    this.clearTimer();
    this.debounceTimer = setTimeout(() => this.emitSearch(query), 300);
  }

  protected onSelect(location: WeatherLocation): void {
    this.locationSelected.emit(location);
    this.searchInput.nativeElement.value = `${location.name}, ${location.country}`;
    this.cleared.emit();
  }

  protected onClear(): void {
    this.searchInput.nativeElement.value = '';
    this.cleared.emit();
  }

  private emitSearch(query: string): void {
    query.length >= 2 ? this.search.emit(query) : this.cleared.emit();
  }

  private clearTimer(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }
}
