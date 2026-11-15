
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_CONFIG } from '../core/config/api.config';

export interface State {
  stateCode: string;
  stateName: string;
}

export interface City {
  cityId: number;
  cityName: string;
  stateCode: string;
}

export interface Rto {
  rtoCode: string;
  rtoName: string;
  stateCode: string;
  cityId: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminLocationService {

  private readonly http = inject(HttpClient);

  private readonly baseUrl = API_CONFIG.adminUrl;

  getStates(): Observable<State[]> {
    return this.http.get<State[]>(`${this.baseUrl}/states`);
  }

  createState(data: State): Observable<State> {
    return this.http.post<State>(`${this.baseUrl}/states`, data);
  }

  updateState(code: string, data: State): Observable<State> {
    return this.http.put<State>(
      `${this.baseUrl}/states/${encodeURIComponent(code)}`,
      data
    );
  }

  deleteState(code: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/states/${encodeURIComponent(code)}`
    );
  }

  getCities(stateCode: string): Observable<City[]> {
    return this.http.get<City[]>(
      `${this.baseUrl}/states/${encodeURIComponent(stateCode)}/cities`
    );
  }

  createCity(data: { cityName: string; stateCode: string }): Observable<City> {
    return this.http.post<City>(`${this.baseUrl}/cities`, data);
  }

  updateCity(
    id: number,
    data: { cityName: string; stateCode: string }
  ): Observable<City> {
    return this.http.put<City>(`${this.baseUrl}/cities/${id}`, data);
  }

  deleteCity(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/cities/${id}`);
  }

  getRtos(cityId: number): Observable<Rto[]> {
    return this.http.get<Rto[]>(`${this.baseUrl}/cities/${cityId}/rtos`);
  }

  createRto(data: Rto): Observable<Rto> {
    return this.http.post<Rto>(`${this.baseUrl}/rtos`, data);
  }

  updateRto(code: string, data: Rto): Observable<Rto> {
    return this.http.put<Rto>(
      `${this.baseUrl}/rtos/${encodeURIComponent(code)}`,
      data
    );
  }

  deleteRto(code: string): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/rtos/${encodeURIComponent(code)}`
    );
  }
}
