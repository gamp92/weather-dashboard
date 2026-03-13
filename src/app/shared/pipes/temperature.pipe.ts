import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'temperature', standalone: true })
export class TemperaturePipe implements PipeTransform {
  transform(value: number, unit: 'C' | 'F' = 'C'): string {
    const converted = unit === 'F' ? (value * 9) / 5 + 32 : value;
    return `${String(Math.round(converted))}°`;
  }
}
