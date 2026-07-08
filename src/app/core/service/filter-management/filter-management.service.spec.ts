import { TestBed } from '@angular/core/testing';

import { FilterManagementService } from './filter-management.service';

describe('FilterManagementService', () => {
  let service: FilterManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
