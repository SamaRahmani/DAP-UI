
import { TestBed } from '@angular/core/testing';
import { AdminVehicleService } from './admin-vehicle';

describe('AdminVehicleService', () => {
  let service: AdminVehicleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminVehicleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
