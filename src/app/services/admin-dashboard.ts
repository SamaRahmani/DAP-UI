import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
  `${environment.apiBaseUrl}/dashboard/summary`;

  getDashboardSummary(): Observable<AdminDashboardSummary> {
    return this.http.get<AdminDashboardSummary>(this.apiUrl);
  }
}