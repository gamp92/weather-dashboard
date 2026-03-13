import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GeolocationCoords } from '../interfaces/location.interface';

const toCoords = (pos: GeolocationPosition): GeolocationCoords => ({
  latitude: pos.coords.latitude,
  longitude: pos.coords.longitude,
});

const getPosition = (): Promise<GeolocationPosition> =>
  new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject);
  });

@Injectable({ providedIn: 'root' })
export class GeolocationService {
  getCurrentCoords(): Observable<GeolocationCoords> {
    return from(getPosition()).pipe(
      map(toCoords),
      catchError((e: GeolocationPositionError) =>
        throwError(() => new Error(e.message))
      )
    );
  }
}
