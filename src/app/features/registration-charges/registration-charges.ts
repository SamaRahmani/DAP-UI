
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import {
  AdminRegistrationChargeService,
  RegistrationCharge,
  RegistrationChargeRequest,
  ChargeScope
} from '../../services/admin-registration-charge';

// =====================================
// INTERFACES
// =====================================

interface StateOption {
  stateCode: string;
  stateName: string;
}

interface CityOption {
  cityId: number;
  cityName: string;
  stateCode: string;
}

// =====================================
// COMPONENT
// =====================================

@Component({
  selector: 'app-registration-charges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration-charges.html',
  styleUrl: './registration-charges.css'
})
export class RegistrationCharges implements OnInit {

  // =====================================
  // DEPENDENCY INJECTION
  // =====================================

  private http = inject(HttpClient);

  private registrationChargeService =
    inject(AdminRegistrationChargeService);

  private cdr = inject(ChangeDetectorRef);

  private readonly locationBaseUrl =
    environment.apiBaseUrl;

  // =====================================
  // DATA
  // =====================================

  registrationCharges: RegistrationCharge[] = [];

  states: StateOption[] = [];

  cities: CityOption[] = [];

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
  // FORM
  // =====================================

  showForm = false;
  isEditMode = false;

  formCharge: RegistrationChargeRequest = {
    chargeScope: 'NATIONAL',
    stateCode: null,
    cityId: null,
    chargeName: '',
    chargeValue: 0
  };

  editingChargeId: number | null = null;

  // =====================================
  // DELETE CONFIRMATION
  // =====================================

  showDeletePopup = false;

  chargeToDelete: RegistrationCharge | null = null;

  // =====================================
  // INITIALIZATION
  // =====================================

  ngOnInit(): void {
    this.loadRegistrationCharges();
    this.loadStates();
  }

  // =====================================
  // GETTERS
  // =====================================

  get filteredCharges(): RegistrationCharge[] {

    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.registrationCharges;
    }

    return this.registrationCharges.filter(charge =>
      charge.chargeName.toLowerCase().includes(search) ||
      charge.chargeScope.toLowerCase().includes(search) ||
      (charge.stateCode ?? '').toLowerCase().includes(search) ||
      String(charge.cityId ?? '').includes(search) ||
      String(charge.chargeValue).includes(search) ||
      String(charge.registrationChargeId).includes(search)
    );
  }

  get nationalCount(): number {
    return this.registrationCharges.filter(
      charge => charge.chargeScope === 'NATIONAL'
    ).length;
  }

  get stateCount(): number {
    return this.registrationCharges.filter(
      charge => charge.chargeScope === 'STATE'
    ).length;
  }

  get cityCount(): number {
    return this.registrationCharges.filter(
      charge => charge.chargeScope === 'CITY'
    ).length;
  }

  // =====================================
  // LOAD REGISTRATION CHARGES
  // =====================================

  loadRegistrationCharges(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.registrationChargeService.getAll().subscribe({

      next: (data: RegistrationCharge[]) => {

        this.registrationCharges = data;
        this.isLoading = false;

        console.log('Registration Charges:', data);
        console.log('Total records:', this.registrationCharges.length);
        console.log('Filtered records:', this.filteredCharges.length);

        this.cdr.detectChanges();
      },

      error: (error: HttpErrorResponse) => {

        this.isLoading = false;

        this.errorMessage =
          error.error?.message ||
          'Unable to load registration charges.';

        console.error('Registration charges loading failed:', error);

        this.cdr.detectChanges();
      }

    });
  }

  // =====================================
  // LOAD STATES
  // =====================================

  loadStates(): void {

    this.http.get<StateOption[]>(
      `${this.locationBaseUrl}/states`
    ).subscribe({

      next: (data: StateOption[]) => {

        this.states = data;

        this.cdr.detectChanges();
      },

      error: (error: HttpErrorResponse) => {

        console.error('States loading failed:', error);

        this.errorMessage = 'Unable to load states.';

        this.cdr.detectChanges();
      }

    });
  }

  // =====================================
  // LOAD CITIES BY STATE
  // =====================================

  loadCities(stateCode: string): void {

    this.formCharge.cityId = null;
    this.cities = [];

    if (!stateCode) {
      this.cdr.detectChanges();
      return;
    }

    this.http.get<CityOption[]>(
      `${this.locationBaseUrl}/states/${stateCode}/cities`
    ).subscribe({

      next: (data: CityOption[]) => {

        this.cities = data;

        this.cdr.detectChanges();
      },

      error: (error: HttpErrorResponse) => {

        console.error('Cities loading failed:', error);

        this.errorMessage = 'Unable to load cities.';

        this.cdr.detectChanges();
      }

    });
  }

  // =====================================
  // CHANGE CHARGE SCOPE
  // =====================================

  onScopeChange(): void {

    this.formCharge.stateCode = null;
    this.formCharge.cityId = null;

    this.cities = [];

    this.cdr.detectChanges();
  }

  // =====================================
  // CHANGE STATE
  // =====================================

  onStateChange(): void {

    this.formCharge.cityId = null;
    this.cities = [];

    if (
      this.formCharge.chargeScope === 'CITY' &&
      this.formCharge.stateCode
    ) {
      this.loadCities(this.formCharge.stateCode);
    }

    this.cdr.detectChanges();
  }

  // =====================================
  // OPEN ADD FORM
  // =====================================

  openAddForm(): void {

    this.isEditMode = false;
    this.editingChargeId = null;

    this.formCharge = {
      chargeScope: 'NATIONAL',
      stateCode: null,
      cityId: null,
      chargeName: '',
      chargeValue: 0
    };

    this.cities = [];

    this.errorMessage = '';
    this.successMessage = '';

    this.showForm = true;

    this.cdr.detectChanges();
  }

  // =====================================
  // OPEN EDIT FORM
  // =====================================

  openEditForm(charge: RegistrationCharge): void {

    this.isEditMode = true;

    this.editingChargeId = charge.registrationChargeId;

    this.formCharge = {
      chargeScope: charge.chargeScope,
      stateCode: charge.stateCode,
      cityId: charge.cityId,
      chargeName: charge.chargeName,
      chargeValue: charge.chargeValue
    };

    this.cities = [];

    this.errorMessage = '';
    this.successMessage = '';

    this.showForm = true;

    if (charge.chargeScope === 'CITY' && charge.stateCode) {

      this.http.get<CityOption[]>(
        `${this.locationBaseUrl}/states/${charge.stateCode}/cities`
      ).subscribe({

        next: (data: CityOption[]) => {

          this.cities = data;

          this.cdr.detectChanges();
        },

        error: (error: HttpErrorResponse) => {

          console.error('Cities loading failed:', error);

          this.errorMessage = 'Unable to load cities.';

          this.cdr.detectChanges();
        }

      });
    }

    this.cdr.detectChanges();
  }

  // =====================================
  // CLOSE FORM
  // =====================================

  closeForm(): void {

    this.showForm = false;

    this.errorMessage = '';

    this.cdr.detectChanges();
  }

  // =====================================
  // SAVE REGISTRATION CHARGE
  // =====================================

  saveCharge(): void {

    this.errorMessage = '';
    this.successMessage = '';

    const chargeName = this.formCharge.chargeName.trim();

    const chargeValue = Number(this.formCharge.chargeValue);

    // Validate charge name
    if (!chargeName) {

      this.errorMessage = 'Charge name is required.';

      return;
    }

    // Validate charge value
    if (!Number.isFinite(chargeValue) || chargeValue < 0) {

      this.errorMessage =
        'Enter a valid non-negative charge value.';

      return;
    }

    // Validate charge name length
    if (chargeName.length > 100) {

      this.errorMessage =
        'Charge name cannot exceed 100 characters.';

      return;
    }

    let stateCode: string | null = null;

    let cityId: number | null = null;

    // STATE and CITY validation
    if (
      this.formCharge.chargeScope === 'STATE' ||
      this.formCharge.chargeScope === 'CITY'
    ) {

      if (!this.formCharge.stateCode) {

        this.errorMessage = 'Please select a state.';

        return;
      }

      stateCode = this.formCharge.stateCode;
    }

    // CITY validation
    if (this.formCharge.chargeScope === 'CITY') {

      if (!this.formCharge.cityId) {

        this.errorMessage = 'Please select a city.';

        return;
      }

      cityId = Number(this.formCharge.cityId);
    }

    // Prepare request
    const request: RegistrationChargeRequest = {

      chargeScope: this.formCharge.chargeScope,

      stateCode,

      cityId,

      chargeName,

      chargeValue
    };

    this.isSaving = true;

    this.cdr.detectChanges();

    // Decide CREATE or UPDATE
    const operation =
      this.isEditMode && this.editingChargeId !== null

        ? this.registrationChargeService.update(
            this.editingChargeId,
            request
          )

        : this.registrationChargeService.create(request);

    operation.subscribe({

      next: () => {

        this.isSaving = false;

        this.showForm = false;

        this.successMessage = this.isEditMode
          ? 'Registration charge updated successfully.'
          : 'Registration charge created successfully.';

        this.cdr.detectChanges();

        this.loadRegistrationCharges();
      },

      error: (error: HttpErrorResponse) => {

        this.isSaving = false;

        this.errorMessage =
          error.error?.message ||
          'Unable to save registration charge.';

        console.error('Registration charge save failed:', error);

        this.cdr.detectChanges();
      }

    });
  }

  // =====================================
  // DELETE CONFIRMATION
  // =====================================

  deleteCharge(charge: RegistrationCharge): void {

    this.chargeToDelete = charge;

    this.showDeletePopup = true;

    this.cdr.detectChanges();
  }

  cancelDelete(): void {

    this.showDeletePopup = false;

    this.chargeToDelete = null;

    this.cdr.detectChanges();
  }

  // =====================================
  // CONFIRM DELETE
  // =====================================

  confirmDelete(): void {

    if (!this.chargeToDelete) {
      return;
    }

    this.isDeleting = true;

    const id = this.chargeToDelete.registrationChargeId;

    this.cdr.detectChanges();

    this.registrationChargeService.delete(id).subscribe({

      next: () => {

        this.isDeleting = false;

        this.showDeletePopup = false;

        this.chargeToDelete = null;

        this.successMessage =
          'Registration charge deleted successfully.';

        this.cdr.detectChanges();

        this.loadRegistrationCharges();
      },

      error: (error: HttpErrorResponse) => {

        this.isDeleting = false;

        this.errorMessage =
          error.error?.message ||
          'Unable to delete registration charge.';

        console.error('Registration charge deletion failed:', error);

        this.cdr.detectChanges();
      }

    });
  }

  // =====================================
  // DISPLAY HELPERS
  // =====================================

  getStateName(stateCode: string | null): string {

    if (!stateCode) {
      return 'All India';
    }

    const state = this.states.find(
      item => item.stateCode === stateCode
    );

    return state ? state.stateName : stateCode;
  }

  getCityName(cityId: number | null): string {

    if (cityId === null) {
      return 'All cities';
    }

    const city = this.cities.find(
      item => item.cityId === cityId
    );

    return city ? city.cityName : `City ID: ${cityId}`;
  }

  getScopeLabel(scope: ChargeScope): string {

    return scope.charAt(0) + scope.slice(1).toLowerCase();
  }

}
