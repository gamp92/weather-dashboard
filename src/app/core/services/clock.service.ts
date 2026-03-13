import { Injectable, OnDestroy, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClockService implements OnDestroy {
  private readonly timer: ReturnType<typeof setInterval>;

  readonly tick = signal(new Date());

  constructor() {
    this.timer = setInterval(() => { this.tick.set(new Date()); }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
