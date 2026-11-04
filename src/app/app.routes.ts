
import { Routes } from '@angular/router';

import { AdminLayout } from './layout/admin-layout/admin-layout';
import { Dashboard } from './features/dashboard/dashboard';
import { Vehicles } from './features/vehicles/vehicles';
import { Locations } from './features/locations/locations';
import { InsuranceComponent } from './features/insurance/insurance';
import { RegistrationCharges } from './features/registration-charges/registration-charges';
import { Taxes } from './features/taxes/taxes';


export const routes: Routes = [
  {
    path: '',
    component: AdminLayout,
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
      { path: 'insurance', component: InsuranceComponent },
      { path: 'registration-charges', component: RegistrationCharges },
      { path: 'taxes', component: Taxes },
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  }
];
