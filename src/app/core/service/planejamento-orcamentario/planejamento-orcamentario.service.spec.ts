import { TestBed } from '@angular/core/testing';

import { PlanejamentoOrcamentarioService } from './planejamento-orcamentario.service';

describe('PlanejamentoOrcamentarioService', () => {
  let service: PlanejamentoOrcamentarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanejamentoOrcamentarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
