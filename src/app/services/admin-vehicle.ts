import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Vehicle } from '../models/vehicle.model';

@Injectable({
  providedIn: 'root'
})
export class AdminVehicleService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8080/api/v1/admin/vehicles';

  getAllVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.apiUrl);
  }

  getVehicleById(vehicleId: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(
      `${this.apiUrl}/${encodeURIComponent(vehicleId)}`
    );
  }

  createVehicle(vehicle: Vehicle): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicle);
  }

  updateVehicle(
    vehicleId: string,
    vehicle: Vehicle
  ): Observable<Vehicle> {
    return this.http.put<Vehicle>(
      `${this.apiUrl}/${encodeURIComponent(vehicleId)}`,
      vehicle
    );
  }

  patchVehicle(
    vehicleId: string,
    changes: Partial<Vehicle>
  ): Observable<Vehicle> {
    return this.http.patch<Vehicle>(
      `${this.apiUrl}/${encodeURIComponent(vehicleId)}`,
      changes
    );
  }

  deleteVehicle(vehicleId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${encodeURIComponent(vehicleId)}`
    );
  }
}