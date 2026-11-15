
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../core/config/api.config';

export interface Insurance {
  insuranceId: string;
  providerName: string;
  percentage: number;
}

export interface InsuranceRequest {
  insuranceId: string;
  providerName: string;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminInsuranceService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${API_CONFIG.adminUrl}/insurance`;

  getAll(): Observable<Insurance[]> {
    return this.http.get<Insurance[]>(this.baseUrl);
  }

  getById(insuranceId: string): Observable<Insurance> {
    return this.http.get<Insurance>(
      `${this.baseUrl}/${encodeURIComponent(insuranceId)}`
    );
  }

  create(data: InsuranceRequest): Observable<Insurance> {
    return this.http.post<Insurance>(this.baseUrl, data);
  }

  update(
    insuranceId: string,
    data: InsuranceRequest
  ): Observable<Insurance> {
    return this.http.put<Insurance>(
      `${this.baseUrl}/${encodeURIComponent(insuranceId)}`,
      data
    );
  }

  delete(insuranceId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${encodeURIComponent(insuranceId)}`
    );
  }
}
