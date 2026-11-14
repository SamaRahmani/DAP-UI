
import { Routes } from '@angular/router';

import { AdminLayout } from './layout/admin-layout/admin-layout';
import { Dashboard } from './features/dashboard/dashboard';
import { Vehicles } from './features/vehicles/vehicles';
import { Locations } from './features/locations/locations';
import { InsuranceComponent } from './features/insurance/insurance';
import { RegistrationCharges } from './features/registration-charges/registration-charges';
import { Taxes } from './features/taxes/taxes';
import { UserManagement } from './features/user-management/user-management';

import { AdminLogin } from './features/auth/admin-login';
import { adminAuthGuard } from './core/auth/admin-auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: AdminLogin
  },
  {
    path: '',
    component: AdminLayout,
    canActivate: [adminAuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'vehicles',
        component: Vehicles
      },
      {
        path: 'locations',
        component: Locations
      },
      {
        path: 'insurance',
        component: InsuranceComponent
      },
      {
        path: 'registration-charges',
        component: RegistrationCharges
      },
      {
        path: 'taxes',
        component: Taxes
      },
      {
        path: 'users',
        component: UserManagement
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
