import { TestBed } from '@angular/core/testing';
import { TemperatureUnitService } from '../src/app/core/services/temperature-unit.service';

describe('TemperatureUnitService', () => {
  let service: TemperatureUnitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemperatureUnitService);
  });

  it('should default to Celsius', () => {
    expect(service.unit()).toBe('C');
  });

  it('should switch to Fahrenheit after first toggle', () => {
    service.toggle();
    expect(service.unit()).toBe('F');
  });

  it('should switch back to Celsius after second toggle', () => {
    service.toggle();
    service.toggle();
    expect(service.unit()).toBe('C');
  });
});
