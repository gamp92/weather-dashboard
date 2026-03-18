import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TemperatureUnitService {
  private readonly _unit = signal<'C' | 'F'>('C');
  readonly unit = this._unit.asReadonly();

  toggle(): void {
    this._unit.update(u => (u === 'C' ? 'F' : 'C'));
  }
}
