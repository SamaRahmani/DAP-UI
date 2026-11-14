import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.apiBaseUrl,
  authUrl: `${environment.apiBaseUrl}/api/auth`,
  adminUrl: `${environment.apiBaseUrl}/api/v1/admin`
};