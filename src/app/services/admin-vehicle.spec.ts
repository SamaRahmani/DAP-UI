import { TestBed } from '@angular/core/testing';
import { AdminVehicle } from './admin-vehicle';

describe('AdminVehicle', () => {
  let service: AdminVehicle;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminVehicle);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
