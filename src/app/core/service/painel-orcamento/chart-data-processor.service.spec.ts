import { TestBed } from '@angular/core/testing';

import { ChartDataProcessorService } from './chart-data-processor.service';

describe('ChartDataProcessorService', () => {
  let service: ChartDataProcessorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartDataProcessorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
