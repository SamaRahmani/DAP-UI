
import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  AdminLocationService,
  State,
  City,
  Rto
} from '../../services/admin-location.service';

type EditorType = 'state' | 'city' | 'rto';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './locations.html',
  styleUrl: './locations.css'
})
export class Locations implements OnInit {

  private locationService = inject(AdminLocationService);
  private cdr = inject(ChangeDetectorRef);

  // Location data
  states: State[] = [];
  cities: Record<string, City[]> = {};
  rtos: Record<number, Rto[]> = {};

  // Expanded rows
  expandedStates = new Set<string>();
  expandedCities = new Set<number>();

  // Loading states
  loadingStates = false;
  loadingCities = new Set<string>();
  loadingRtos = new Set<number>();

  // Editor
  editorType: EditorType | null = null;
  editing = false;
  saving = false;

  // Selected location
  selectedStateCode = '';
  selectedCityId: number | null = null;

  // Forms
  stateForm: State = {
    stateCode: '',
    stateName: ''
  };

  cityForm = {
    cityName: '',
    stateCode: ''
  };

  rtoForm: Rto = {
    rtoCode: '',
    rtoName: '',
    stateCode: '',
    cityId: 0
  };

  errorMessage = '';

  ngOnInit(): void {
    this.loadStates();
  }

  // =====================================
  // LOAD STATES
  // =====================================

  loadStates(): void {
    this.loadingStates = true;
    this.errorMessage = '';

    this.locationService.getStates().subscribe({
      next: data => {
        this.states = data;
        this.loadingStates = false;

        console.log('States loaded:', this.states);

        this.cdr.markForCheck();
      },

      error: error => {
        console.error('Error loading states:', error);

        this.loadingStates = false;
        this.errorMessage = 'Unable to load states.';

        this.cdr.markForCheck();
      }
    });
  }

  // =====================================
  // LOAD CITIES
  // =====================================

  toggleState(state: State): void {

    if (this.expandedStates.has(state.stateCode)) {
      this.expandedStates.delete(state.stateCode);
      return;
    }

    this.expandedStates.add(state.stateCode);

    if (!this.cities[state.stateCode]) {
      this.loadCities(state.stateCode);
    }
  }

  loadCities(stateCode: string): void {

    this.loadingCities.add(stateCode);

    this.locationService.getCities(stateCode).subscribe({
      next: data => {
        this.cities[stateCode] = data;
        this.loadingCities.delete(stateCode);

        this.cdr.markForCheck();
      },

      error: error => {
        console.error('Error loading cities:', error);

        this.loadingCities.delete(stateCode);
        this.errorMessage = 'Unable to load cities.';

        this.cdr.markForCheck();
      }
    });
  }

  // =====================================
  // LOAD RTOS
  // =====================================

  toggleCity(city: City): void {

    if (this.expandedCities.has(city.cityId)) {
      this.expandedCities.delete(city.cityId);
      return;
    }

    this.expandedCities.add(city.cityId);

    if (!this.rtos[city.cityId]) {
      this.loadRtos(city.cityId);
    }
  }

  loadRtos(cityId: number): void {

    this.loadingRtos.add(cityId);

    this.locationService.getRtos(cityId).subscribe({
      next: data => {
        this.rtos[cityId] = data;
        this.loadingRtos.delete(cityId);

        this.cdr.markForCheck();
      },

      error: error => {
        console.error('Error loading RTOs:', error);

        this.loadingRtos.delete(cityId);
        this.errorMessage = 'Unable to load RTOs.';

        this.cdr.markForCheck();
      }
    });
  }

  // =====================================
  // STATE FORM
  // =====================================

  openAddState(): void {
    this.editorType = 'state';
    this.editing = false;

    this.stateForm = {
      stateCode: '',
      stateName: ''
    };

    this.errorMessage = '';
  }

  openEditState(state: State): void {
    this.editorType = 'state';
    this.editing = true;

    this.stateForm = { ...state };

    this.errorMessage = '';
  }

  // =====================================
  // CITY FORM
  // =====================================

  openAddCity(stateCode: string): void {
    this.editorType = 'city';
    this.editing = false;

    this.selectedStateCode = stateCode;

    this.cityForm = {
      cityName: '',
      stateCode: stateCode
    };

    this.errorMessage = '';
  }

  openEditCity(city: City): void {
    this.editorType = 'city';
    this.editing = true;

    this.selectedStateCode = city.stateCode;
    this.selectedCityId = city.cityId;

    this.cityForm = {
      cityName: city.cityName,
      stateCode: city.stateCode
    };

    this.errorMessage = '';
  }

  // =====================================
  // RTO FORM
  // =====================================

  openAddRto(city: City): void {
    this.editorType = 'rto';
    this.editing = false;

    this.selectedStateCode = city.stateCode;
    this.selectedCityId = city.cityId;

    this.rtoForm = {
      rtoCode: '',
      rtoName: '',
      stateCode: city.stateCode,
      cityId: city.cityId
    };

    this.errorMessage = '';
  }

  openEditRto(rto: Rto): void {
    this.editorType = 'rto';
    this.editing = true;

    this.selectedStateCode = rto.stateCode;
    this.selectedCityId = rto.cityId;

    this.rtoForm = { ...rto };

    this.errorMessage = '';
  }

  // =====================================
  // CLOSE EDITOR
  // =====================================

  closeEditor(): void {
    this.editorType = null;
    this.errorMessage = '';
  }

  // =====================================
  // SAVE STATE / CITY / RTO
  // =====================================

  save(): void {

    if (this.saving || !this.editorType) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    // SAVE STATE
    if (this.editorType === 'state') {

      const request = { ...this.stateForm };

      const operation = this.editing
        ? this.locationService.updateState(
            request.stateCode,
            request
          )
        : this.locationService.createState(request);

      operation.subscribe({

        next: () => {
          this.saving = false;
          this.closeEditor();
          this.loadStates();

          this.cdr.markForCheck();
        },

        error: err => this.handleSaveError(err)

      });
    }

    // SAVE CITY
    if (this.editorType === 'city') {

      const request = { ...this.cityForm };

      const operation = this.editing
        ? this.locationService.updateCity(
            this.selectedCityId!,
            request
          )
        : this.locationService.createCity(request);

      operation.subscribe({

        next: () => {
          this.saving = false;
          this.closeEditor();
          this.loadCities(this.selectedStateCode);

          this.cdr.markForCheck();
        },

        error: err => this.handleSaveError(err)

      });
    }

    // SAVE RTO
    if (this.editorType === 'rto') {

      const request = { ...this.rtoForm };

      const operation = this.editing
        ? this.locationService.updateRto(
            request.rtoCode,
            request
          )
        : this.locationService.createRto(request);

      operation.subscribe({

        next: () => {
          this.saving = false;
          this.closeEditor();
          this.loadRtos(request.cityId);

          this.cdr.markForCheck();
        },

        error: err => this.handleSaveError(err)

      });
    }
  }

  // =====================================
  // SAVE ERROR
  // =====================================

  private handleSaveError(err: any): void {

    this.saving = false;

    this.errorMessage =
      err?.error?.message ||
      'Unable to save the record. Please try again.';

    this.cdr.markForCheck();
  }

  // =====================================
  // DELETE STATE
  // =====================================

  deleteState(state: State): void {

    if (!confirm(`Delete state ${state.stateName}?`)) {
      return;
    }

    this.locationService.deleteState(state.stateCode).subscribe({

      next: () => {
        delete this.cities[state.stateCode];

        this.expandedStates.delete(state.stateCode);

        this.loadStates();
      },

      error: err => this.showError(err)

    });
  }

  // =====================================
  // DELETE CITY
  // =====================================

  deleteCity(city: City): void {

    if (!confirm(`Delete city ${city.cityName}?`)) {
      return;
    }

    this.locationService.deleteCity(city.cityId).subscribe({

      next: () => {
        this.loadCities(city.stateCode);

        delete this.rtos[city.cityId];

        this.expandedCities.delete(city.cityId);
      },

      error: err => this.showError(err)

    });
  }

  // =====================================
  // DELETE RTO
  // =====================================

  deleteRto(rto: Rto): void {

    if (!confirm(`Delete RTO ${rto.rtoCode}?`)) {
      return;
    }

    this.locationService.deleteRto(rto.rtoCode).subscribe({

      next: () => {
        this.loadRtos(rto.cityId);
      },

      error: err => this.showError(err)

    });
  }

  // =====================================
  // COMMON ERROR HANDLING
  // =====================================

  private showError(err: any): void {

    this.errorMessage =
      err?.error?.message ||
      'Unable to complete the operation.';

    this.cdr.markForCheck();
  }

  // =====================================
  // TRACKING FUNCTIONS
  // =====================================

  trackState(_: number, state: State): string {
    return state.stateCode;
  }

  trackCity(_: number, city: City): number {
    return city.cityId;
  }

  trackRto(_: number, rto: Rto): string {
    return rto.rtoCode;
  }
}
