
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export type ChargeScope = 'NATIONAL' | 'STATE' | 'CITY';

export interface RegistrationCharge {
  registrationChargeId: number;
  chargeScope: ChargeScope;
  stateCode: string | null;
  cityId: number | null;
  chargeName: string;
  chargeValue: number;
}

export interface RegistrationChargeRequest {
  chargeScope: ChargeScope;
  stateCode: string | null;
  cityId: number | null;
  chargeName: string;
  chargeValue: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminRegistrationChargeService {

  private http = inject(HttpClient);

  private readonly baseUrl =
  `${environment.apiBaseUrl}/registration-charges`;

  getAll(): Observable<RegistrationCharge[]> {
    return this.http.get<RegistrationCharge[]>(this.baseUrl);
  }

  getById(id: number): Observable<RegistrationCharge> {
    return this.http.get<RegistrationCharge>(`${this.baseUrl}/${id}`);
  }

  getByState(stateCode: string): Observable<RegistrationCharge[]> {
    return this.http.get<RegistrationCharge[]>(
      `${this.baseUrl}/state/${stateCode}`
    );
  }

  getStateLevelCharges(stateCode: string): Observable<RegistrationCharge[]> {
    return this.http.get<RegistrationCharge[]>(
      `${this.baseUrl}/state/${stateCode}/state-level`
    );
  }

  getCityLevelCharges(cityId: number): Observable<RegistrationCharge[]> {
    return this.http.get<RegistrationCharge[]>(
      `${this.baseUrl}/city/${cityId}`
    );
  }

  create(data: RegistrationChargeRequest): Observable<RegistrationCharge> {
    return this.http.post<RegistrationCharge>(this.baseUrl, data);
  }

  update(
    id: number,
    data: RegistrationChargeRequest
  ): Observable<RegistrationCharge> {
    return this.http.put<RegistrationCharge>(
      `${this.baseUrl}/${id}`,
      data
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
