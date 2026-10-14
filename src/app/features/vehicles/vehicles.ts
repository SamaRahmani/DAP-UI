import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Vehicle } from '../../models/vehicle.model';
import { AdminVehicleService } from '../../services/admin-vehicle';

@Component({
  selector: 'app-vehicles',
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css'
})
export class Vehicles implements OnInit {

  // Service responsible for communicating with Spring Boot.
  private readonly vehicleService = inject(AdminVehicleService);

  // Used to refresh the view after an API response.
  private readonly cdr = inject(ChangeDetectorRef);

  // Vehicles retrieved from the backend.
  vehicles: Vehicle[] = [];

  // Loading and error states.
  isLoading = false;
  errorMessage = '';

  // Search input value.
  searchText = '';

  // Controls whether the Add/Edit form is visible.
  showForm = false;

  // Determines whether we are adding or editing.
  isEditMode = false;

  // Stores the ID of the vehicle being edited.
  editingVehicleId: string | null = null;

  // Form data.
  formVehicle: Vehicle = this.createEmptyVehicle();

  // Load vehicles automatically when the component initializes.
  ngOnInit(): void {
    this.loadVehicles();
  }

  // Fetch vehicles from Spring Boot.
  loadVehicles(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.vehicleService.getAllVehicles().subscribe({

      next: (vehicles) => {
        this.vehicles = vehicles;
        this.isLoading = false;

        // Explicitly refresh the view after receiving the response.
        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error('Failed to load vehicles:', error);

        this.errorMessage =
          'Unable to load vehicles. Please check the backend connection.';

        this.isLoading = false;

        this.cdr.detectChanges();
      }

    });
  }

  // Returns vehicles matching the search.
  get filteredVehicles(): Vehicle[] {

    const search = this.searchText.trim().toLowerCase();

    if (!search) {
      return this.vehicles;
    }

    return this.vehicles.filter(vehicle =>
      vehicle.vehicleId.toLowerCase().includes(search) ||
      vehicle.modelName.toLowerCase().includes(search) ||
      vehicle.variantName.toLowerCase().includes(search) ||
      vehicle.fuelType.toLowerCase().includes(search) ||
      vehicle.transmissionType.toLowerCase().includes(search)
    );
  }

  // Creates an empty vehicle form.
  private createEmptyVehicle(): Vehicle {
    return {
      vehicleId: '',
      modelName: '',
      variantName: '',
      fuelType: '',
      transmissionType: '',
      exShowroomPrice: 0,
      lengthMm: 0,
      groundClearanceMm: 0
    };
  }

  // Opens the form for adding a vehicle.
  openAddForm(): void {
    this.isEditMode = false;
    this.editingVehicleId = null;
    this.formVehicle = this.createEmptyVehicle();
    this.showForm = true;
  }

  // Opens the form with the selected vehicle's data.
  openEditForm(vehicle: Vehicle): void {
    this.isEditMode = true;
    this.editingVehicleId = vehicle.vehicleId;

    // Copy the object so the table isn't modified before saving.
    this.formVehicle = { ...vehicle };

    this.showForm = true;
  }

  // TEMPORARY: Save locally.
  // We will connect POST and PUT to Spring Boot next.
  saveVehicle(): void {

    const vehicleId = this.formVehicle.vehicleId.trim();

    if (!vehicleId) {
      return;
    }

    // Check for duplicate IDs when adding.
    if (!this.isEditMode) {

      const duplicate = this.vehicles.some(
        vehicle =>
          vehicle.vehicleId.toLowerCase() === vehicleId.toLowerCase()
      );

      if (duplicate) {
        alert('A vehicle with this ID already exists.');
        return;
      }

      this.vehicles = [
        ...this.vehicles,
        {
          ...this.formVehicle,
          vehicleId
        }
      ];

    } else {

      // Find the existing vehicle using its original ID.
      const originalId = this.editingVehicleId;

      this.vehicles = this.vehicles.map(vehicle =>
        vehicle.vehicleId === originalId
          ? {
              ...this.formVehicle,
              vehicleId: originalId!
            }
          : vehicle
      );

    }

    this.closeForm();
  }

  // TEMPORARY: Delete locally.
  // We will connect DELETE to Spring Boot next.
  deleteVehicle(vehicle: Vehicle): void {

    const confirmed = window.confirm(
      `Are you sure you want to delete ${vehicle.vehicleId} (${vehicle.modelName})?`
    );

    if (!confirmed) {
      return;
    }

    this.vehicles = this.vehicles.filter(
      item => item.vehicleId !== vehicle.vehicleId
    );
  }

  // Closes the form without saving.
  closeForm(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.editingVehicleId = null;
    this.formVehicle = this.createEmptyVehicle();
  }

}