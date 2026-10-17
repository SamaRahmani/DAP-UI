import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminDashboardSummary {
  totalVehicles: number;
  totalRtoLocations: number;
  totalInsuranceProviders: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:8080/api/v1/admin/dashboard/summary';

  getDashboardSummary(): Observable<AdminDashboardSummary> {
    return this.http.get<AdminDashboardSummary>(this.apiUrl);
  }
}