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
  successMessage = '';

  // Indicates whether a save request is in progress.
  isSaving = false;

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

  // Controls the delete confirmation popup.
  showDeletePopup = false;

  // Stores the vehicle selected for deletion.
  vehicleToDelete: Vehicle | null = null;

  // Indicates whether a delete request is in progress.
  isDeleting = false;


  // Load vehicles automatically when the component initializes.
  ngOnInit(): void {
    this.loadVehicles();
  }


  // GET: Fetch vehicles from Spring Boot.
  loadVehicles(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.vehicleService.getAllVehicles().subscribe({

      next: (vehicles) => {

        this.vehicles = vehicles;
        this.isLoading = false;

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

    this.errorMessage = '';
    this.successMessage = '';

    this.showForm = true;

  }


  // Opens the form with the selected vehicle's data.
  openEditForm(vehicle: Vehicle): void {

    this.isEditMode = true;
    this.editingVehicleId = vehicle.vehicleId;

    // Copy the object so the table isn't modified before saving.
    this.formVehicle = { ...vehicle };

    this.errorMessage = '';
    this.successMessage = '';

    this.showForm = true;

  }


  // POST: Create or PUT: Update a vehicle.
  saveVehicle(): void {

    if (this.isSaving) {
      return;
    }

    const vehicleId = this.formVehicle.vehicleId.trim();

    if (!vehicleId) {
      this.errorMessage = 'Vehicle ID is required.';
      return;
    }

    // Prepare vehicle data.
    const vehicleToSave: Vehicle = {
      ...this.formVehicle,
      vehicleId
    };

    // POST: Create a new vehicle.
    if (!this.isEditMode) {

      // Check for duplicate IDs in the currently loaded vehicles.
      const duplicate = this.vehicles.some(
        vehicle =>
          vehicle.vehicleId.toLowerCase() === vehicleId.toLowerCase()
      );

      if (duplicate) {

        this.errorMessage =
          'A vehicle with this ID already exists.';

        return;

      }

      this.isSaving = true;
      this.errorMessage = '';

      this.vehicleService.createVehicle(vehicleToSave).subscribe({

        next: (createdVehicle) => {

          console.log(
            'Vehicle created successfully:',
            createdVehicle
          );

          this.isSaving = false;

          this.closeForm();

          this.successMessage =
            'Vehicle created successfully.';

          // Retrieve the latest vehicles from the backend.
          this.loadVehicles();

        },

        error: (error) => {

          console.error('Failed to create vehicle:', error);

          this.isSaving = false;

          if (error.status === 409) {

            this.errorMessage =
              'A vehicle with this ID already exists.';

          } else if (error.status === 400) {

            this.errorMessage =
              'Invalid vehicle data. Please check the form.';

          } else {

            this.errorMessage =
              'Failed to create vehicle. Please check the backend logs.';

          }

        }

      });

    } else {

      // PUT: Update an existing vehicle.
      const originalId = this.editingVehicleId;

      if (!originalId) {

        this.errorMessage =
          'Unable to identify the vehicle being updated.';

        return;

      }

      const updatedVehicle: Vehicle = {
        ...this.formVehicle,
        vehicleId: originalId
      };

      this.isSaving = true;
      this.errorMessage = '';

      this.vehicleService.updateVehicle(
        originalId,
        updatedVehicle
      ).subscribe({

        next: (response) => {

          console.log(
            'Vehicle updated successfully:',
            response
          );

          this.isSaving = false;

          this.closeForm();

          this.successMessage =
            'Vehicle updated successfully.';

          // Fetch the latest records from the backend.
          this.loadVehicles();

        },

        error: (error) => {

          console.error('Failed to update vehicle:', error);

          this.isSaving = false;

          this.errorMessage =
            'Failed to update vehicle. Please check the backend logs.';

        }

      });

    }

  }


  // Opens the delete confirmation popup.
  deleteVehicle(vehicle: Vehicle): void {

    if (this.isDeleting) {
      return;
    }

    this.vehicleToDelete = vehicle;

    this.showDeletePopup = true;

    this.errorMessage = '';
    this.successMessage = '';

  }


  // Closes the popup without deleting the vehicle.
  cancelDelete(): void {

    if (this.isDeleting) {
      return;
    }

    this.showDeletePopup = false;
    this.vehicleToDelete = null;

  }


  // DELETE: Delete the selected vehicle after confirmation.
  confirmDelete(): void {

    if (!this.vehicleToDelete || this.isDeleting) {
      return;
    }

    const vehicle = this.vehicleToDelete;

    this.isDeleting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.vehicleService.deleteVehicle(
      vehicle.vehicleId
    ).subscribe({

      next: () => {

        console.log(
          'Vehicle deleted successfully:',
          vehicle.vehicleId
        );

        this.isDeleting = false;

        this.showDeletePopup = false;
        this.vehicleToDelete = null;

        this.successMessage =
          'Vehicle deleted successfully.';

        // Reload vehicles from the backend.
        this.loadVehicles();

      },

      error: (error) => {

        console.error('Failed to delete vehicle:', error);

        this.isDeleting = false;

        this.errorMessage =
          'Unable to delete the vehicle. Please check the backend logs.';

      }

    });

  }


  // Closes the Add/Edit form without saving.
  closeForm(): void {

    this.showForm = false;

    this.isEditMode = false;

    this.editingVehicleId = null;

    this.formVehicle = this.createEmptyVehicle();

  }

}