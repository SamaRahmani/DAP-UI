
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import {
  AdminInsuranceService,
  Insurance,
  InsuranceRequest
} from '../../services/admin-insurance';

@Component({
  selector: 'app-insurance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './insurance.html',
  styleUrl: './insurance.css'
})
export class InsuranceComponent implements OnInit {

  private insuranceService = inject(AdminInsuranceService);
  private cdr = inject(ChangeDetectorRef);

  // =====================================
  // INSURANCE DATA
  // =====================================

  insurances: Insurance[] = [];

  // =====================================
  // LOADING STATES
  // =====================================

  isLoading = false;
  isSaving = false;
  isDeleting = false;

  // =====================================
  // MESSAGES
  // =====================================

  errorMessage = '';
  successMessage = '';

  // =====================================
  // SEARCH
  // =====================================

  searchText = '';

  // =====================================
  // FORM VISIBILITY
  // =====================================

  showForm = false;
  isEditMode = false;

  // =====================================
  // INSURANCE FORM
  // =====================================

  formInsurance: InsuranceRequest = {
    insuranceId: '',
    providerName: '',
    percentage: 0
  };

  // =====================================
  // DELETE CONFIRMATION
  // =====================================

  showDeletePopup = false;
  insuranceToDelete: Insurance | null = null;

  // =====================================
  // INITIALIZATION
  // =====================================

  ngOnInit(): void {
    this.loadInsurances();
  }

  // =====================================
  // FILTER INSURANCE PROVIDERS
  // =====================================

  get filteredInsurances(): Insurance[] {

    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.insurances;
    }

    return this.insurances.filter(insurance =>
      insurance.insuranceId.toLowerCase().includes(search) ||
      insurance.providerName.toLowerCase().includes(search) ||
      insurance.percentage.toString().includes(search)
    );
  }

  // =====================================
  // LOAD INSURANCE PROVIDERS
  // =====================================

  loadInsurances(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.cdr.markForCheck();

    this.insuranceService.getAll().subscribe({

      next: (data: Insurance[]) => {

        this.insurances = data;
        this.isLoading = false;

        console.log('Insurance providers loaded:', this.insurances);

        this.cdr.markForCheck();
      },

      error: (error: HttpErrorResponse) => {

        console.error('Error loading insurance providers:', error);

        this.isLoading = false;
        this.errorMessage = 'Unable to load insurance providers.';

        this.cdr.markForCheck();
      }

    });
  }

  // =====================================
  // OPEN ADD FORM
  // =====================================

  openAddForm(): void {

    this.isEditMode = false;
    this.showForm = true;

    this.successMessage = '';
    this.errorMessage = '';

    this.formInsurance = {
      insuranceId: '',
      providerName: '',
      percentage: 0
    };

    this.cdr.markForCheck();
  }

  // =====================================
  // OPEN EDIT FORM
  // =====================================

  openEditForm(insurance: Insurance): void {

    this.isEditMode = true;
    this.showForm = true;

    this.successMessage = '';
    this.errorMessage = '';

    this.formInsurance = {
      insuranceId: insurance.insuranceId,
      providerName: insurance.providerName,
      percentage: insurance.percentage
    };

    this.cdr.markForCheck();
  }

  // =====================================
  // CLOSE FORM
  // =====================================

  closeForm(): void {

    this.showForm = false;
    this.errorMessage = '';

    this.cdr.markForCheck();
  }

  // =====================================
  // SAVE INSURANCE
  // =====================================

  saveInsurance(): void {

    if (this.isSaving) {
      return;
    }

    const request: InsuranceRequest = {
      insuranceId: this.formInsurance.insuranceId.trim(),
      providerName: this.formInsurance.providerName.trim(),
      percentage: Number(this.formInsurance.percentage)
    };

    // Validation
    if (!request.insuranceId || !request.providerName) {

      this.errorMessage = 'Please fill in all required fields.';
      this.cdr.markForCheck();
      return;
    }

    if (
      !Number.isFinite(request.percentage) ||
      request.percentage < 0 ||
      request.percentage > 100
    ) {

      this.errorMessage = 'Percentage must be between 0 and 100.';
      this.cdr.markForCheck();
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.markForCheck();

    const operation = this.isEditMode
      ? this.insuranceService.update(request.insuranceId, request)
      : this.insuranceService.create(request);

    operation.subscribe({

      next: () => {

        this.isSaving = false;
        this.showForm = false;

        this.successMessage = this.isEditMode
          ? 'Insurance provider updated successfully.'
          : 'Insurance provider added successfully.';

        this.loadInsurances();

        this.cdr.markForCheck();
      },

      error: (error: HttpErrorResponse) => {

        console.error('Error saving insurance:', error);

        this.isSaving = false;

        this.errorMessage =
          error.error?.message ||
          'Unable to save insurance provider. Please try again.';

        this.cdr.markForCheck();
      }

    });
  }

  // =====================================
  // OPEN DELETE CONFIRMATION
  // =====================================

  deleteInsurance(insurance: Insurance): void {

    this.insuranceToDelete = insurance;
    this.showDeletePopup = true;

    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.markForCheck();
  }

  // =====================================
  // CANCEL DELETE
  // =====================================

  cancelDelete(): void {

    this.showDeletePopup = false;
    this.insuranceToDelete = null;

    this.cdr.markForCheck();
  }

  // =====================================
  // CONFIRM DELETE
  // =====================================

  confirmDelete(): void {

    if (!this.insuranceToDelete || this.isDeleting) {
      return;
    }

    const insuranceId = this.insuranceToDelete.insuranceId;

    this.isDeleting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.markForCheck();

    this.insuranceService.delete(insuranceId).subscribe({

      next: () => {

        this.isDeleting = false;
        this.showDeletePopup = false;
        this.insuranceToDelete = null;

        this.successMessage =
          'Insurance provider deleted successfully.';

        this.loadInsurances();

        this.cdr.markForCheck();
      },

      error: (error: HttpErrorResponse) => {

        console.error('Error deleting insurance:', error);

        this.isDeleting = false;

        this.errorMessage =
          error.error?.message ||
          'Unable to delete insurance provider. Please try again.';

        this.cdr.markForCheck();
      }

    });
  }

}
