
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface ManagedUser {
  id: number;
  fullName: string;
  email: string;
  enabled: boolean;
  createdAt: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly http = inject(HttpClient);

  private readonly usersUrl =
    `${API_CONFIG.baseUrl}/api/v1/admin/users`;

  getUsers(search = ''): Observable<ManagedUser[]> {
    let params = new HttpParams();

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<ManagedUser[]>(this.usersUrl, { params });
  }

  getUserById(id: number): Observable<ManagedUser> {
    return this.http.get<ManagedUser>(`${this.usersUrl}/${id}`);
  }

  changeRole(
    id: number,
    role: 'ROLE_USER' | 'ROLE_ADMIN'
  ): Observable<ManagedUser> {
    return this.http.patch<ManagedUser>(
      `${this.usersUrl}/${id}/role`,
      { role }
    );
  }

  changeStatus(
    id: number,
    enabled: boolean
  ): Observable<ManagedUser> {
    return this.http.patch<ManagedUser>(
      `${this.usersUrl}/${id}/status`,
      { enabled }
    );
  }
}
