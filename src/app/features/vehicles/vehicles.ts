import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Vehicle } from '../../models/vehicle.model';

@Component({
  selector: 'app-vehicles',
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.html',
  styleUrl: './vehicles.css'
})
export class Vehicles {

  // Sample vehicle data.
  // We will replace this array with backend API data later.
  vehicles: Vehicle[] = [
    {
      vehicleId: 'MB-C200',
      modelName: 'C-Class',
      variantName: 'C 200',
      fuelType: 'Petrol',
      transmissionType: 'Automatic',
      exShowroomPrice: 6000000,
      lengthMm: 4751,
      groundClearanceMm: 157
    },
    {
      vehicleId: 'MB-C220D',
      modelName: 'C-Class',
      variantName: 'C 220d',
      fuelType: 'Diesel',
      transmissionType: 'Automatic',
      exShowroomPrice: 6200000,
      lengthMm: 4751,
      groundClearanceMm: 157
    },
    {
      vehicleId: 'MB-E200',
      modelName: 'E-Class',
      variantName: 'E 200',
      fuelType: 'Petrol',
      transmissionType: 'Automatic',
      exShowroomPrice: 8000000,
      lengthMm: 4949,
      groundClearanceMm: 146
    },
    {
      vehicleId: 'MB-E220D',
      modelName: 'E-Class',
      variantName: 'E 220d',
      fuelType: 'Diesel',
      transmissionType: 'Automatic',
      exShowroomPrice: 8500000,
      lengthMm: 4949,
      groundClearanceMm: 146
    },
    {
      vehicleId: 'MB-GLC220D',
      modelName: 'GLC',
      variantName: 'GLC 220d',
      fuelType: 'Diesel',
      transmissionType: 'Automatic',
      exShowroomPrice: 7800000,
      lengthMm: 4716,
      groundClearanceMm: 200
    },
    {
      vehicleId: 'MB-GLC300',
      modelName: 'GLC',
      variantName: 'GLC 300',
      fuelType: 'Petrol',
      transmissionType: 'Automatic',
      exShowroomPrice: 7500000,
      lengthMm: 4716,
      groundClearanceMm: 200
    }
  ];

  // Search input value.
  searchText = '';

  // Controls whether the Add/Edit form is visible.
  showForm = false;

  // Determines whether we are adding or editing.
  isEditMode = false;

  // Stores the ID of the vehicle being edited.
  // We use this to prevent changing the primary key accidentally.
  editingVehicleId: string | null = null;

  // Form data.
  formVehicle: Vehicle = this.createEmptyVehicle();

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

  // Saves a new vehicle or updates an existing vehicle.
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

  // Deletes a vehicle after confirmation.
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