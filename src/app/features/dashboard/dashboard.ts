import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import {
  AdminDashboardService,
  AdminDashboardSummary
} from '../../services/admin-dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  private readonly dashboardService = inject(AdminDashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  summary: AdminDashboardSummary = {
    totalVehicles: 0,
    totalRtoLocations: 0,
    totalInsuranceProviders: 0
  };

  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboardSummary().subscribe({

      next: (response: AdminDashboardSummary) => {

        console.log('Dashboard statistics loaded:', response);

        this.summary = response;
        this.isLoading = false;

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error('Failed to load dashboard statistics:', error);

        this.errorMessage =
          'Unable to load dashboard statistics. Please check the backend connection.';

        this.isLoading = false;

        this.cdr.detectChanges();
      }

    });

  }
}