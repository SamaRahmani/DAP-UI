
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

  private http = inject(HttpClient);

  private readonly baseUrl =
  `${environment.apiBaseUrl}/insurance`;

  // GET: All insurance providers
  getAll(): Observable<Insurance[]> {
    return this.http.get<Insurance[]>(this.baseUrl);
  }

  // GET: Insurance provider by ID
  getById(insuranceId: string): Observable<Insurance> {
    return this.http.get<Insurance>(
      `${this.baseUrl}/${insuranceId}`
    );
  }

  // POST: Create insurance provider
  create(data: InsuranceRequest): Observable<Insurance> {
    return this.http.post<Insurance>(this.baseUrl, data);
  }

  // PUT: Update insurance provider
  update(
    insuranceId: string,
    data: InsuranceRequest
  ): Observable<Insurance> {
    return this.http.put<Insurance>(
      `${this.baseUrl}/${insuranceId}`,
      data
    );
  }

  // DELETE: Delete insurance provider
  delete(insuranceId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/${insuranceId}`
    );
  }
}
