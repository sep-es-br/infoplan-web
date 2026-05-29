import { TestBed } from '@angular/core/testing';

import { PainelObrasService } from './painel-obras.service';

describe('PainelObrasService', () => {
  let service: PainelObrasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PainelObrasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
